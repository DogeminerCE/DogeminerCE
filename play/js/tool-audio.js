// Source item voices and drill loops, routed through CE's existing audio policy.
(function () {
    'use strict';
    const audio = AudioManager.prototype, game = DogeMinerGame.prototype;
    const cfg = window.DogeMinerDrillData.config, sprite = window.DogeMinerDrillData.sprite;
    const cuts = ['cut2','cut3','cut4','cut5'], loudness = {cut2:-18.09,cut3:-18.19,cut4:-17.36,cut5:-17.68};
    function cutGain(variant) {
        const mean = cuts.reduce((sum,key)=>sum+loudness[key],0)/cuts.length;
        return cfg.cutGain * Math.pow(10,Math.max(-6,Math.min(6,mean-loudness[variant]))/20);
    }
    function variant(random = Math.random, last) { const pool = cuts.filter(key=>key!==last); return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]; }
    audio.canPlayToolAudio = function () { return this.soundEnabled && this.rockSoundsEnabled !== false && !this._audioSuspended && !this.isBackgroundMuted() && !window.CEParityTesting?.active; };
    audio.playToolVoice = function (name, {volume=.2,rate=1} = {}) {
        if (!this.canPlayToolAudio()) return false;
        const aliases = {pickaxe:'pick',hit_hard:'hitHard',hit_ground:'hitGround'};
        let voice = this.soundEffects[aliases[name] || name];
        if (!voice && /^(pew[1-4]|lasersword[12]|helpmine00[1-7])$/.test(name) && typeof Howl !== 'undefined') {
            voice = this.soundEffects[name] = new Howl({src:[`../assets/SoundsSrc/main/${name}.${name.startsWith('helpmine')?'mp3':'wav'}`],volume});
        }
        if (Array.isArray(voice)) voice = voice[Math.floor(Math.random()*voice.length)];
        if (!voice) return false;
        const id = voice.play(); voice.volume?.(volume * (this.soundVolume ?? 1),id); voice.rate?.(rate,id); return true;
    };
    game.playToolGround = function () { window.audioManager?.playToolVoice('hit_ground',{volume:1}); };
    game.playToolHit = function (critical, options={}) {
        const meta = window.DogeMinerToolProfiles.profile(this.getEquippedPickaxe());
        if (critical) {
            if (options.critSound === false) return;
            const custom = meta.critsound;
            if (typeof custom === 'string') return window.audioManager?.playToolVoice(custom,{volume:.1,rate:1});
            const sounds = custom?.sounds?.filter(Boolean), name = sounds?.length ? sounds[Math.floor(Math.random()*sounds.length)] : 'hit_hard';
            return window.audioManager?.playToolVoice(name,{volume:custom?.vol??.1,rate:custom?.rate??1});
        }
        if (options.hitSound === false) return;
        const sounds = meta.hitsound, name = Array.isArray(sounds) ? sounds[Math.floor(Math.random()*sounds.length)] : sounds || 'pickaxe';
        return window.audioManager?.playToolVoice(name,{volume:.2,rate:1});
    };
    game.playHelperRockHit = function (random=Math.random) {
        if (this.isMobileDevice?.() || this.isRockRegenerating) return;
        const dps = this.getPlanetMiningDPS(this.currentLevel); if (dps<=0) return;
        this._helperHitRhythm ||= 0;
        let play = dps>.7, volume=.1;
        if (dps<=.7) {play=this._helperHitRhythm===1;volume=dps>.4?.2:.3;if(this._helperHitRhythm>(dps>.4?1:2))this._helperHitRhythm=0;this._helperHitRhythm++;}
        if (play) window.audioManager?.playToolVoice('helpmine00'+Math.ceil(7*random()),{volume,rate:1});
    };
    function ramp(param,value,ms,context,equalPower=false) {
        const time=context.currentTime, old=param.value, seconds=Math.max(.002,ms/1000);
        param.cancelScheduledValues(time);param.setValueAtTime(old,time);
        if(equalPower && Math.abs(value-old)>.0001){
            const curve=Float32Array.from({length:32},(_,i)=>old+(value-old)*(value>old?Math.sin(i/31*Math.PI/2):1-Math.cos(i/31*Math.PI/2)));
            param.setValueCurveAtTime(curve,time+.0005,seconds);
        } else param.linearRampToValueAtTime(value,time+seconds);
    }
    audio._drillVoice = function (region,pitch,loop) {
        const context=window.Howler?.ctx,buffer=this._drillAudioBuffer;if(!context||!buffer)return null;
        const src=context.createBufferSource(),gain=context.createGain(),entry=sprite[region+(loop?'_intro':'')];
        if(!entry)return null;
        src.buffer=buffer;src.playbackRate.value=pitch;gain.gain.value=0;src.connect(gain);gain.connect(window.Howler.masterGain||context.destination);
        if(loop){const part=sprite[region+'_loop'];src.loop=true;src.loopStart=part[0]/1000;src.loopEnd=(part[0]+part[1])/1000;}
        src.start(0,entry[0]/1000);if(!loop)src.stop(context.currentTime+entry[1]/1000/pitch);
        const voice={src,gain,done:false};this._drillVoices ||= new Set();this._drillVoices.add(voice);src.onended=()=>{voice.done=true;this._drillVoices.delete(voice);src.disconnect();gain.disconnect();};return voice;
    };
    audio._fadeDrillVoice = function (voice,ms,equalPower=false) {
        if(!voice||voice.done)return;const context=window.Howler.ctx;
        ramp(voice.gain.gain,0,ms,context,equalPower);try{voice.src.stop(context.currentTime+ms/1000+.01);}catch(_){}
    };
    audio.stopDrill = function ({windDown=false}={}) {
        const state=this._drillAudio;this._drillAudio=null;
        if(!windDown){for(const voice of this._drillVoices||[]){if(!voice.done){voice.gain.gain.cancelScheduledValues(window.Howler.ctx.currentTime);voice.gain.gain.value=0;try{voice.src.stop();}catch(_){}}}this._drillWind=null;return;}
        if(!state)return;
        this._fadeDrillVoice(state.idle,cfg.winddownFadeMs,true);this._fadeDrillVoice(state.cut,cfg.winddownFadeMs,true);
        if(windDown&&this.canPlayToolAudio()){
            this._fadeDrillVoice(this._drillWind,50);this._drillWind=this._drillVoice('winddown',state.pitch,false);
            if(this._drillWind)ramp(this._drillWind.gain.gain,cfg.volume*cfg.winddownGain*(this.soundVolume??1),50,window.Howler.ctx);
        }else{this._fadeDrillVoice(this._drillWind,50);this._drillWind=null;}
    };
    audio.syncDrillAudio = function ({active,cutting,profile}) {
        if(!active||!this.canPlayToolAudio()||window.Howler?._muted){this.stopDrill();return;}
        const context=window.Howler?.ctx;if(!context)return;
        if(!this._drillAudioBuffer){
            if(!this._drillAudioLoad)this._drillAudioLoad=fetch('../assets/audio/audiosprite_drill.mp3').then(r=>{if(!r.ok)throw Error('Drill audio unavailable');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).then(b=>{this._drillAudioBuffer=b;}).catch(error=>{console.warn(error);this._drillAudioLoad=null;});
            return;
        }
        let state=this._drillAudio;
        if(!state){const idle=this._drillVoice('idle',profile.pitch,true);if(!idle)return;state=this._drillAudio={idle,cut:null,pitch:profile.pitch,last:null};ramp(idle.gain.gain,cfg.volume*cfg.idleGain*(this.soundVolume??1),6,context);}
        if(state.pitch!==profile.pitch){state.pitch=profile.pitch;for(const voice of[state.idle,state.cut])voice?.src.playbackRate.setTargetAtTime(profile.pitch,context.currentTime,.04);}
        if(cutting&&!state.cut){
            const picked=variant(Math.random,state.last);state.last=picked;state.cut=this._drillVoice(picked,profile.pitch,true);
            if(state.cut)ramp(state.cut.gain.gain,cfg.volume*cutGain(picked)*(this.soundVolume??1),5,context);
            ramp(state.idle.gain.gain,0,cfg.cutInFadeMs,context);
        }else if(!cutting&&state.cut){this._fadeDrillVoice(state.cut,cfg.cutOutFadeMs,true);state.cut=null;ramp(state.idle.gain.gain,cfg.volume*cfg.idleGain*(this.soundVolume??1),cfg.cutOutFadeMs,context,true);}
    };
    const policy=audio.applyAudioPolicy;
    audio.applyAudioPolicy=function(...args){const result=policy.apply(this,args);if(!this.canPlayToolAudio())this.stopDrill();return result;};
    const stop=audio.stopAllSoundEffects;
    audio.stopAllSoundEffects=function(...args){this.stopDrill();return stop.apply(this,args);};
    const mining=audio.isMiningSound;
    audio.isMiningSound=function(name){return mining.call(this,name)||/^(pickaxe|hit_hard|hit_ground|helpmine00[1-7]|pew[1-4]|lasersword[12])$/.test(name);};
    window.DogeMinerToolAudio=Object.freeze({cutGain,variant});
})();
