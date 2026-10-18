// DM2's first Moon launch: explicit initiation, 20% volume, 5% steps and
// four-second skip arming. The player's audio policy stays authoritative.
(function () {
    'use strict';
    const config=Object.freeze({volume:.2,volumeStep:.05,skipMs:4000,skipFadeMs:500,introFadeMs:250,loadMs:20000,
        fallback:'https://www.youtube.com/watch?v=tUFnqPPVavE'});
    const ids=['moon-launch-start','moon-launch-controls','moon-launch-play','moon-launch-quieter','moon-launch-louder',
        'moon-launch-volume','moon-launch-status','moon-launch-fallback','moon-launch-confirm','moon-launch-cancel',
        'moon-launch-confirm-skip','moon-launch-finish'];
    const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
    const current=(g,s)=>g._moonLaunch===s&&!s.closed;
    const visible=node=>node&&!node.hidden&&!node.closest('[hidden]')&&!node.disabled&&node.getClientRects?.().length!==0;
    function layout(g){
        const s=g._moonLaunch;if(!s)return;
        const view=window.visualViewport,left=view?.offsetLeft||0,top=view?.offsetTop||0,width=view?.width||innerWidth,height=view?.height||innerHeight;
        let x=left,y=top,w=width,h=height;
        if(width>768){
            const boxes=['left-panel','right-panel'].map(id=>document.getElementById(id)?.getBoundingClientRect()).filter(b=>b&&b.width&&b.height);
            if(boxes.length){x=Math.max(left,Math.min(...boxes.map(b=>b.left)));y=Math.max(top,Math.min(...boxes.map(b=>b.top)));
                w=Math.min(left+width,Math.max(...boxes.map(b=>b.right)))-x;h=Math.min(top+height,Math.max(...boxes.map(b=>b.bottom)))-y;}
        }
        const stage=g.cutsceneOverlay.querySelector('.moon-launch-stage');
        Object.assign(stage.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
    }
    function status(g,text){g._moonNodes['moon-launch-status'].textContent=text;}
    function sync(g){
        const s=g._moonLaunch;if(!s)return;
        const video=g.cutsceneVideo,n=g._moonNodes;
        n['moon-launch-play'].textContent=video.paused?'▶':'Ⅱ';
        n['moon-launch-play'].setAttribute('aria-label',video.paused?'Play video':'Pause video');
        n['moon-launch-play'].setAttribute('aria-pressed',String(!video.paused));
        n['moon-launch-volume'].textContent='Volume: '+Math.round(s.volume*100)+'%';
        n['moon-launch-quieter'].disabled=s.volume<=0;n['moon-launch-louder'].disabled=s.volume>=1;
    }
    function play(g){
        const s=g._moonLaunch;if(!s||s.phase!=='playing'||s.confirm)return;
        window.audioManager?.applyMediaPolicy?.(g.cutsceneVideo,true);
        try{const result=g.cutsceneVideo.play();result?.catch?.(()=>{if(current(g,s)){status(g,'Press play to watch!');sync(g);}});}
        catch(error){status(g,'Press play to watch!');}
        sync(g);
    }
    function toggle(g){
        const s=g._moonLaunch;if(!s||s.phase!=='playing'||s.confirm)return;
        if(g.cutsceneVideo.paused)play(g);else g.cutsceneVideo.pause();sync(g);
    }
    function volume(g,step){
        const s=g._moonLaunch;if(!s)return;
        s.volume=Math.max(0,Math.min(1,Math.round((s.volume+step)*100)/100));g.cutsceneVideo.volume=s.volume;sync(g);
    }
    function arm(g,s){
        if(!current(g,s))return;s.armed=true;g.cutsceneSkipButton.hidden=false;g.cutsceneSkipButton.disabled=false;
        g.cutsceneSkipButton.classList.remove('hidden');
        if(!reduced())g.cutsceneSkipButton.animate?.([{opacity:0},{opacity:1}],{duration:config.skipFadeMs,easing:'ease-out'});
    }
    function initiate(g){
        const s=g._moonLaunch;if(!s||s.phase!=='intro')return;
        s.phase='playing';const n=g._moonNodes,start=n['moon-launch-start'];
        n['moon-launch-controls'].hidden=false;g.cutsceneVideo.hidden=false;
        if(reduced()||!start.animate)start.hidden=true;
        else {s.introAnimation=start.animate([{opacity:1},{opacity:0}],{duration:config.introFadeMs,easing:'ease-out',fill:'forwards'});
            s.introAnimation.onfinish=()=>{if(current(g,s))start.hidden=true;s.introAnimation.cancel();};}
        if(!reduced())g.cutsceneVideo.animate?.([{opacity:0},{opacity:1}],{duration:400,easing:'ease-out'});
        status(g,'Press play to watch!');play(g);n['moon-launch-play'].focus({preventScroll:true});
        s.skipTimer=setTimeout(()=>arm(g,s),config.skipMs);
    }
    function requestSkip(g){
        const s=g._moonLaunch;if(!s||!s.armed||s.confirm)return;
        s.confirm=true;s.resume=!g.cutsceneVideo.paused;g.cutsceneVideo.pause();
        const node=g._moonNodes['moon-launch-confirm'];node.hidden=false;
        if(!reduced())node.animate?.([{opacity:0,scale:.85},{opacity:1,scale:1}],{duration:220,easing:'ease-out'});
        g._moonNodes['moon-launch-cancel'].focus({preventScroll:true});sync(g);
    }
    function cancelSkip(g){
        const s=g._moonLaunch;if(!s?.confirm)return;s.confirm=false;g._moonNodes['moon-launch-confirm'].hidden=true;
        if(s.resume)play(g);g.cutsceneSkipButton.focus({preventScroll:true});
    }
    function reset(g){
        const s=g._moonLaunch;if(!s)return;
        s.closed=true;s.introAnimation?.cancel();clearTimeout(s.skipTimer);clearTimeout(s.loadTimer);g.cutsceneVideo.pause();
        g.cutsceneVideo.removeAttribute('src');g.cutsceneVideo.load?.();
        g.cutsceneOverlay.classList.remove('active');g.cutsceneOverlay.setAttribute('aria-hidden','true');
        document.body.classList.remove('cutscene-active');
        document.removeEventListener('keydown',s.keys,true);document.removeEventListener('focusin',s.focus,true);
        window.removeEventListener('resize',s.layout);window.visualViewport?.removeEventListener('resize',s.layout);
        window.visualViewport?.removeEventListener('scroll',s.layout);
        for(const [node,inert] of s.inert)if(node.isConnected)node.inert=inert;
        document.body.style.overflow=s.overflow;g._moonLaunch=null;g.isCutscenePlaying=false;
        window.audioManager?.resumeAudio?.();
        if(s.previousFocus?.isConnected)s.previousFocus.focus({preventScroll:true});
    }
    function finish(g){
        const s=g._moonLaunch;if(!s||s.finishing)return false;s.finishing=true;
        const before=g.hasPlayedMoonLaunch,unlocked=g.unlockedLevels;
        g.hasPlayedMoonLaunch=true;g.unlockedLevels=new Set([...unlocked,'moon']);
        let saved=false;try{saved=window.saveManager?.commitStoryProgress?.()===true;}catch(error){console.error('Could not save Moon launch:',error);}
        if(!saved){g.hasPlayedMoonLaunch=before;g.unlockedLevels=unlocked;s.finishing=false;
            s.confirm=false;g._moonNodes['moon-launch-confirm'].hidden=true;
            status(g,'Your progress could not be saved. Please try again.');g._moonNodes['moon-launch-finish'].hidden=false;
            g._moonNodes['moon-launch-finish'].focus({preventScroll:true});return false;}
        reset(g);window.uiManager?.closeMobileMenu?.();g.finishHelperPlacement?.();
        window.uiManager?.initializePlanetTabs?.();window.uiManager?.hideMoonLocked?.();
        if(g.currentLevel!=='moon')window.switchPlanet?.('moon');g.updateUI?.();return true;
    }
    function failed(g){
        const s=g._moonLaunch;if(!s||s.closed)return;
        clearTimeout(s.loadTimer);status(g,'No video? Open the video link, or skip this scene.');arm(g,s);
    }
    function setup(g){
        let overlay=document.getElementById('cutscene-overlay');
        if(!overlay){overlay=document.createElement('div');overlay.id='cutscene-overlay';overlay.className='cutscene-overlay';document.body.append(overlay);}
        overlay.innerHTML=`<section class="moon-launch-stage" role="dialog" aria-modal="true" aria-label="Moon launch">
            <video id="cutscene-video" class="cutscene-video" playsinline preload="metadata" hidden></video>
            <button id="moon-launch-start" type="button"><img class="moon-launch-logo" src="assets/general/logo.webp" alt="Dogeminer"><img class="moon-launch-rocket" src="assets/helpers/rockets/rockets-idle-0.webp" alt=""><span>Press to initiate<br>moon launch!</span></button>
            <div id="moon-launch-controls" hidden><a id="moon-launch-fallback" href="${config.fallback}" target="_blank" rel="noopener noreferrer">No video?<br>Click here</a>
                <span id="moon-launch-volume">Volume: 20%</span><div class="moon-launch-volume-buttons"><button id="moon-launch-quieter" type="button" aria-label="Lower video volume">−</button><button id="moon-launch-louder" type="button" aria-label="Raise video volume">+</button></div>
                <button id="moon-launch-play" type="button" aria-label="Play video">▶</button><p id="moon-launch-status" role="status" aria-live="polite"></p><button id="moon-launch-finish" class="moon-launch-button" type="button" hidden>TRY AGAIN</button></div>
            <button id="cutscene-skip" class="moon-launch-button hidden" type="button" hidden disabled>SKIP</button>
            <div id="moon-launch-confirm" hidden><section role="alertdialog" aria-modal="true" aria-labelledby="moon-launch-confirm-title" aria-describedby="moon-launch-confirm-description"><h2 id="moon-launch-confirm-title">Are you sure?</h2><p id="moon-launch-confirm-description">This scene will not be shown again.</p><div><button id="moon-launch-cancel" class="moon-launch-button" type="button">KEEP WATCHING</button><button id="moon-launch-confirm-skip" class="moon-launch-button" type="button">Very Understand</button></div></section></div>
        </section>`;
        overlay.setAttribute('aria-hidden','true');g.cutsceneOverlay=overlay;g.cutsceneVideo=document.getElementById('cutscene-video');g.cutsceneSkipButton=document.getElementById('cutscene-skip');
        g._moonNodes=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));const n=g._moonNodes;
        n['moon-launch-start'].addEventListener('click',()=>initiate(g));n['moon-launch-play'].addEventListener('click',()=>toggle(g));
        n['moon-launch-quieter'].addEventListener('click',()=>volume(g,-config.volumeStep));n['moon-launch-louder'].addEventListener('click',()=>volume(g,config.volumeStep));
        n['moon-launch-fallback'].addEventListener('click',()=>{g.cutsceneVideo.pause();sync(g);});
        n['moon-launch-cancel'].addEventListener('click',()=>cancelSkip(g));n['moon-launch-confirm-skip'].addEventListener('click',()=>finish(g));
        n['moon-launch-finish'].addEventListener('click',()=>finish(g));g.cutsceneSkipButton.addEventListener('click',()=>requestSkip(g));
        g.cutsceneVideo.addEventListener('ended',()=>{if(g._moonLaunch?.phase==='playing')finish(g);});g.cutsceneVideo.addEventListener('error',()=>failed(g));
        g.cutsceneVideo.addEventListener('loadedmetadata',()=>clearTimeout(g._moonLaunch?.loadTimer));
        g.cutsceneVideo.addEventListener('playing',()=>{if(g._moonLaunch){status(g,'');sync(g);}});g.cutsceneVideo.addEventListener('pause',()=>sync(g));
    }
    function open(g){
        if(g.hasPlayedMoonLaunch||g.isCutscenePlaying||g.currentLevel!=='earth'||!g.helpers?.some(h=>h.type==='spaceRocket')
            ||g.isStoryOpen||g._dogebagReveal||g.isTransitioning||g.isBetaReportOpen||g.isOfflineReportOpen||g.isIntroPlaying)return false;
        const n=g._moonNodes,s={phase:'intro',volume:config.volume,closed:false,armed:false,confirm:false,
            previousFocus:document.activeElement,overflow:document.body.style.overflow,
            inert:[...document.body.children].filter(node=>node!==g.cutsceneOverlay).map(node=>[node,node.inert])};
        g._moonLaunch=s;g.isCutscenePlaying=true;g.isMouseDown=false;g.isSpaceDown=false;g.endSwing?.();
        for(const [node] of s.inert)node.inert=true;document.body.style.overflow='hidden';
        window.audioManager?.suspendAllAudio?.();window.uiManager?.closeMobileMenu?.();
        n['moon-launch-start'].hidden=false;n['moon-launch-controls'].hidden=true;n['moon-launch-confirm'].hidden=true;n['moon-launch-finish'].hidden=true;
        g.cutsceneSkipButton.hidden=true;g.cutsceneSkipButton.disabled=true;g.cutsceneSkipButton.classList.add('hidden');
        g.cutsceneVideo.hidden=true;g.cutsceneVideo.pause();g.cutsceneVideo.volume=config.volume;
        window.audioManager?.applyMediaPolicy?.(g.cutsceneVideo,true);g.cutsceneVideo.src='../assets/The Moon Launch.mp4';
        g.cutsceneOverlay.classList.add('active');g.cutsceneOverlay.setAttribute('aria-hidden','false');document.body.classList.add('cutscene-active');
        const controls=()=>s.confirm?[n['moon-launch-cancel'],n['moon-launch-confirm-skip']]:[...(s.phase==='intro'?[n['moon-launch-start']]:[]),n['moon-launch-fallback'],n['moon-launch-quieter'],n['moon-launch-louder'],n['moon-launch-play'],n['moon-launch-finish'],g.cutsceneSkipButton].filter(visible);
        s.keys=event=>{
            if(!current(g,s))return;const {key}=event;
            if(!['Tab','Escape','Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return;
            event.preventDefault();event.stopImmediatePropagation();
            if(key==='Tab'){const nodes=controls(),index=nodes.indexOf(document.activeElement);nodes[(index+(event.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();}
            else if(key==='Escape'){if(s.confirm)cancelSkip(g);else requestSkip(g);}
            else if(key==='Enter'||key===' '){const target=controls().includes(document.activeElement)?document.activeElement:s.phase==='intro'?n['moon-launch-start']:n['moon-launch-play'];target?.click();}
            else if(!s.confirm&&s.phase==='playing')volume(g,['ArrowLeft','ArrowDown'].includes(key)?-config.volumeStep:config.volumeStep);
        };
        s.focus=event=>{if(!g.cutsceneOverlay.contains(event.target))controls()[0]?.focus({preventScroll:true});};s.layout=()=>layout(g);
        document.addEventListener('keydown',s.keys,true);document.addEventListener('focusin',s.focus,true);
        window.addEventListener('resize',s.layout);window.visualViewport?.addEventListener('resize',s.layout);window.visualViewport?.addEventListener('scroll',s.layout);
        s.loadTimer=setTimeout(()=>failed(g),config.loadMs);layout(g);sync(g);n['moon-launch-start'].focus({preventScroll:true});return true;
    }
    const proto=DogeMinerGame.prototype;
    proto.resetMoonLaunchPresentation=function(){reset(this);};
    proto.advanceMoonLaunch=function(){if(!this.hasPlayedMoonLaunch&&!this.isCutscenePlaying&&this.currentLevel==='earth'
        &&this.helpers?.some(h=>h.type==='spaceRocket')&&this.canPresentStory?.())open(this);};
    proto.handleMoonLaunchController=function(justPressed,GP){
        const s=this._moonLaunch;if(!s)return;
        if(justPressed(GP.DPAD_LEFT)||justPressed(GP.DPAD_RIGHT)){
            if(s.confirm)(document.activeElement===this._moonNodes['moon-launch-cancel']?this._moonNodes['moon-launch-confirm-skip']:this._moonNodes['moon-launch-cancel']).focus();
            else volume(this,justPressed(GP.DPAD_LEFT)?-config.volumeStep:config.volumeStep);
        }
        if(justPressed(GP.B)){if(s.confirm)cancelSkip(this);else requestSkip(this);}
        if(justPressed(GP.Y))toggle(this);
        if(justPressed(GP.A)){if(s.confirm)document.activeElement?.click();else if(s.phase==='intro')initiate(this);else requestSkip(this);}
    };
    window.DogeMinerMoonLaunch=Object.freeze({config,setup,open,initiate,toggle,volume,requestSkip,cancelSkip,finish,reset});
})();
