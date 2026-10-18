// Held drilling with source cadence/contact phases. No offline catch-up hits.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype, tools = window.DogeMinerTools, data = window.DogeMinerDrillData;
    const config = data.config, profiles = data.profiles;
    const clamp = n => Math.max(0, Math.min(1, n));
    const ease = (a, b, dt, ms) => a + (b - a) * (1 - Math.exp(-dt / (ms / 3)));
    function noise(seed) {
        seed ^= seed << 13;
        seed = (Math.imul(seed, (Math.imul(Math.imul(seed, seed), 15731) + 789221) | 0) + 1376312589) | 0;
        return 1 - (2147483647 & seed) / 1073741824;
    }
    function smoothNoise(at, seed) {
        const whole = Math.floor(at), n = at - whole;
        const a = noise((57 * whole + 7919 * seed) | 0), b = noise((57 * (whole + 1) + 7919 * seed) | 0);
        return a + (b - a) * n * n * (3 - 2 * n);
    }
    function cadence(profile, random = Math.random) { return Math.max(30, (config.hitMinMs + (config.hitMaxMs - config.hitMinMs) * random()) * profile.cadence); }
    function pose(time, spin, contact, lowered, bite, profile, offhand = false) {
        const power = spin * spin * (3 - 2 * spin), scale = offhand ? .85 : 1, seed = offhand ? 10 : 0;
        const t = time / 1000 + (offhand ? .013 : 0), c = t * config.shakeHz;
        const amp = power * (config.idleShakePx + (config.drillShakePx - config.idleShakePx) * contact) * profile.fx * scale;
        const angle = lowered * (profile.poseDeg - 28), radians = (28 + angle) * Math.PI / 180;
        let x = lowered * profile.poseX + smoothNoise(c, seed + 1) * amp;
        let y = lowered * profile.poseY + smoothNoise(c, seed + 2) * amp + Math.sin(2 * Math.PI * config.rumbleHz * t) * config.rumblePx * power * profile.fx * scale;
        const depth = bite * config.biteDepthPx * profile.bite;
        x += Math.sin(radians) * depth; y -= Math.cos(radians) * depth;
        if (profile.style === 'jackhammer') {
            const piston = Math.sin(2 * Math.PI * config.pistonHz * (1 + .6 * contact) * t) * config.pistonPx * profile.fx * scale * power * (1 + 1.5 * contact);
            x += Math.sin(radians) * piston; y -= Math.cos(radians) * piston;
        }
        return { x, y, angle: 28 + angle + smoothNoise(c, seed + 3) * power * (config.idleShakeDeg + (config.drillShakeDeg - config.idleShakeDeg) * contact) * profile.fx * scale,
            shear: profile.style === 'auger' ? Math.sin(2 * Math.PI * config.spinHz * t) * config.spinWobble * profile.fx * scale * power * (1 + contact) : 0 };
    }
    proto.isDrillEquipped = function () { return !!profiles[tools.id(this.getEquippedPickaxe())]; };
    proto.drillPauseReason = function () {
        if (!this.isPlaying || this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning || this._sunDogeFusion) return 'busy';
        if (document.hidden || document.hasFocus?.() === false) return 'unfocused';
        if (this.isStoryOpen || this.isBetaReportOpen || this.isOfflineReportOpen) return 'story';
        if (this._dogebagReveal || this.isMysteryBoxOpen || document.querySelector('.modal.active,.switcher-modal.active,.dialog-overlay.active,.dia-mission-modal.active,.dia-warning-modal.active,#controller-dialog.active')) return 'dialog';
        if (this.isRockRegenerating) return 'rock';
        return '';
    };
    proto.pressDrill = function (event) {
        if (!this.isDrillEquipped()) return false;
        this.syncDrillRig();
        const state = this._drill;
        if (!state || this.drillPauseReason() && this.drillPauseReason() !== 'rock' || performance.now() < state.equipReadyAt) return true;
        if (state.pressed) return true;
        state.pressed = true; state.over = true; state.event = event || null;
        state.input = event?.toolInput || (event ? 'pointer' : this.isSpaceDown ? 'keyboard' : 'controller');
        state.pointerId = event?.pointerId; this.advanceDrillMining(0); return true;
    };
    proto.releaseDrill = function () { if (this._drill) { this._drill.pressed = false; this._drill.over = false; this._drill.cutting = false; } };
    proto.resetDrill = function (windDown = false) {
        this.releaseDrill(); this._drill = null; document.body?.classList.remove('tool-hold-drill'); window.audioManager?.stopDrill?.({windDown});
        for (const id of ['pickaxe','pickaxe-offhand']) { const node = document.getElementById(id); node?.classList.remove('tool-drilling'); }
        for (const id of ['main-character','main-rock']) { const node = document.getElementById(id); if (node) node.style.translate = ''; }
    };
    proto.syncDrillRig = function () {
        const item = this.getEquippedPickaxe(), id = tools.id(item), profile = profiles[id];
        if (!profile) { if (this._drill) this.resetDrill(true); return; }
        if (this._drill?.item === item && this._drill?.planet === this.currentLevel) return;
        this.resetDrill();
        document.body?.classList.add('tool-hold-drill');
        this._drill = { item, id, profile, planet:this.currentLevel, pressed:false, over:false, cutting:false, elapsed:0, nextHit:0, sinceHit:Infinity, hitGap:0, hits:0, level:0, contact:0, lowered:0, bite:0, pausedBy:'', equipReadyAt:performance.now()+200 };
    };
    proto.advanceDrillMining = function (elapsed) {
        this.syncDrillRig(); const state = this._drill; if (!state) return;
        const dt = Math.max(0, Math.min(250, elapsed)), visualDt = Math.min(100, dt);
        state.elapsed += visualDt; state.sinceHit += dt;
        const reason = this.drillPauseReason(); state.pausedBy = reason;
        const cutting = state.pressed && state.over && !reason;
        if (cutting) {
            if (!state.cutting) state.nextHit = Math.max(0, state.hitGap - state.sinceHit);
            state.nextHit -= dt;
            if (state.nextHit <= 0) {
                this.handleRockClick(state.event, { drill:true, strength:state.profile.strength, textChance:config.textChance, hitSound:false, critSound:true });
                state.hits++; state.sinceHit = 0; state.bite = this._lastToolDouble ? 1.4 : 1;
                const gap = cadence(state.profile);
                state.nextHit = Math.max(.5 * gap, state.nextHit + gap); state.hitGap = state.nextHit;
            }
        }
        state.cutting = cutting;
        const safe = reason !== 'unfocused' && reason !== 'busy', targetSpin = safe ? 1 : 0;
        state.level = targetSpin > state.level ? Math.min(1, state.level + visualDt / config.spinupMs) : Math.max(0, state.level - visualDt / config.spindownMs);
        state.contact = ease(state.contact, cutting ? 1 : 0, visualDt, cutting ? config.poseInMs : config.poseOutMs);
        const targetPose = state.pressed && reason === 'rock' ? 1 - config.respawnLift : cutting ? 1 : 0;
        state.lowered = ease(state.lowered, targetPose, visualDt, targetPose > state.lowered ? config.poseInMs : reason === 'rock' ? config.respawnLiftMs : config.poseOutMs);
        state.bite *= Math.exp(-visualDt / (.45 * config.biteMs));
        const moving = !tools.reduced() && !this.lessEffects;
        state.kick ||= {x:0,y:0,angle:0};
        const instability = state.profile.instability * state.level;
        if (moving && Math.random() < instability * (1 + 2 * state.contact) * visualDt / 1000) {
            const direction = Math.random()*Math.PI*2, amount = (2.5 + 3.5*Math.random())*state.profile.fx;
            state.kick.x += Math.cos(direction)*amount; state.kick.y += Math.sin(direction)*amount; state.kick.angle += 4*(Math.random()-.5)*state.profile.fx;
        }
        const decay = Math.exp(-visualDt/70);
        state.kick.x *= decay;state.kick.y *= decay;state.kick.angle *= decay;
        for (const id of ['pickaxe','pickaxe-offhand']) {
            const node = document.getElementById(id); if (!node) continue;
            node.classList.remove('swing-down','pickaxe-intro'); node.classList.add('tool-drilling');
            const p = pose(state.elapsed,state.level,moving?state.contact:0,state.lowered,moving?state.bite:0,state.profile,id==='pickaxe-offhand');
            if (moving) { p.x+=state.kick.x; p.y+=state.kick.y; p.angle+=state.kick.angle; }
            if (!moving) { p.x = state.lowered * state.profile.poseX; p.y = state.lowered * state.profile.poseY; p.angle = 28 + state.lowered * (state.profile.poseDeg - 28); p.shear = 0; }
            node.style.setProperty('--drill-x',p.x+'px');node.style.setProperty('--drill-y',p.y+'px');node.style.setProperty('--drill-angle',p.angle+'deg');node.style.setProperty('--drill-shear',p.shear+'rad');
        }
        const doge = document.getElementById('main-character'), rock = document.getElementById('main-rock');
        if (doge) doge.style.translate = moving ? `${smoothNoise((state.elapsed-config.dogeLagMs)/1000*config.shakeHz*config.dogeHzScale,21)*state.level*config.dogeFollow-state.lowered*config.dogeBracePx}px ${smoothNoise(state.elapsed/1000*config.shakeHz*.5,22)*state.level*config.dogeFollow}px` : '';
        if (rock) rock.style.translate = moving && cutting ? `${smoothNoise(state.elapsed/1000*config.shakeHz*1.3,31)*config.rockBuzzPx}px ${smoothNoise(state.elapsed/1000*config.shakeHz*1.3,32)*config.rockBuzzPx}px` : '';
        window.audioManager?.syncDrillAudio?.({ active:safe, cutting, profile:state.profile, variant:state.variant });
    };
    const end = proto.endSwing;
    proto.endSwing = function (...args) { if (!this.isMouseDown && !this.isSpaceDown) this.releaseDrill(); return end.apply(this,args); };
    proto.installDrillInput = function () {
        if (this._drillInputInstalled) return; this._drillInputInstalled = true;
        const release = event => { if (event?.type === 'pointerup' && this._drill?.pointerId !== undefined && event.pointerId !== this._drill.pointerId) return; this.releaseDrill(); };
        window.addEventListener('keyup',event=>{if(event.code==='Space'&&this._drill?.input==='keyboard')release();},true);
        window.addEventListener('pointermove',event=>{if(this._drill?.input==='pointer'&&event.buttons===0)release(event);},true);
        window.addEventListener('pointerup',release,true);window.addEventListener('pointercancel',release,true);window.addEventListener('blur',release);
        document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
        for (const id of ['click-overlay','character-container']) {
            const node = document.getElementById(id); if (!node) continue;
            node.addEventListener('pointerdown',event=>{if(!this.isDrillEquipped())return;if(event.button!==0||this._drill?.pressed)return;this.pressDrill(event);if(event.pointerType==='touch')event.preventDefault();});
            node.addEventListener('pointerleave',()=>{if(this._drill?.input==='pointer')this._drill.over=false;});
            node.addEventListener('pointerenter',event=>{if(this._drill?.pressed&&this._drill.input==='pointer'){if(event.buttons===0)release();else this._drill.over=true;}});
        }
    };
    window.DogeMinerDrills = Object.freeze({ config, profiles, cadence, pose, smoothNoise });
})();
