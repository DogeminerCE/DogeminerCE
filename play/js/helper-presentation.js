// Helper layout is presentation only: every owned helper keeps its ID and name.
(function () {
    'use strict';
    const requestWorldFrame=callback=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.request(callback):requestAnimationFrame(callback);
    const cancelWorldFrame=id=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.cancel(id):cancelAnimationFrame(id);
    const proto = DogeMinerGame.prototype;
    const original = {};
    for (const name of ['createHelperSprite', 'clearAllHelperSprites', 'addHelperToCursor', 'startHelperAnimation', 'createCursorSprites', 'clearCursorSprites', 'clearHelperSelection']) original[name] = proto[name];
    const small = new Set(['miningShibe', 'moonShibe', 'partyShibe', 'roboShibe']);
    const large = new Set(['moonBase', 'landerShibe', 'marsBase', 'cloudBase', 'dogeStar', 'titanBase', 'altarOfTheSunDoge']);
    const medium = new Set(['superShibe', 'tardogeis', 'timeTravelDRex']);
    const sameId = (a, b) => String(a) === String(b);
    const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animate = (element, frames, duration = 440) => {
        if (!element?.animate || reducedMotion()) return Promise.resolve();
        const animation = element.animate(frames, {duration, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'none'});
        return animation.finished.catch(() => {});
    };

    proto.updatePlanetSummary = function () {
        const name = document.getElementById('planet-summary-name');
        const population = document.getElementById('planet-summary-population');
        const icon = document.getElementById('planet-summary-icon');
        if (name) name.textContent = this.currentLevel === 'moon' ? 'THE MOON' : String(this.currentLevel).toUpperCase();
        if (population) population.textContent = `POPULATION: ${1 + this.getHelperArrayForLevel().length}`;
        if (icon && icon.dataset.planet !== this.currentLevel) {
            icon.src = `../assets/general/${this.currentLevel}.webp`; icon.dataset.planet = this.currentLevel;
        }
    };
    proto.getHelperDisplaySize = function (type) {
        return small.has(type) ? 30 : large.has(type) ? 90 : medium.has(type) ? 72 : type === 'infiniteDogebility' ? 69 : 60;
    };
    proto.getHelperGroupMembers = function (helper) {
        if (!helper.groupId) return [helper];
        const cache = this._helperGroupCache;
        if (!cache || cache.array !== this.placedHelpers || cache.length !== this.placedHelpers.length) {
            const groups = new Map();
            for (const record of this.placedHelpers) {
                if (!record.groupId) continue;
                const key = `${record.type}:${record.groupId}`;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(record);
            }
            this._helperGroupCache = {array: this.placedHelpers, length: this.placedHelpers.length, groups};
        }
        return this._helperGroupCache.groups.get(`${helper.type}:${helper.groupId}`) || [helper];
    };
    proto.getHelperGroupScale = function (count) { return 1 + Math.min(.6, Math.log2(Math.max(1, count)) * .1); };
    proto.getSelectedHelperMembers = function (type) {
        const selected = this.selectedHelperIds || new Set();
        const records = new Set();
        for (const helper of this.placedHelpers) {
            if ((type && helper.type !== type) || ![...selected].some(id => sameId(id, helper.id))) continue;
            for (const member of this.getHelperGroupMembers(helper)) records.add(member);
        }
        return [...records];
    };
    proto.initializeHelperPresentation = function () {
        this.autoPlaceHelpers = true;
        this._helperFieldEpoch = 0;
        const checkbox = document.getElementById('auto-place-helpers');
        checkbox?.addEventListener('change', () => {
            this.autoPlaceHelpers = checkbox.checked;
            const mobile = document.getElementById('mobile-auto-place-helpers');
            if (mobile) mobile.checked = checkbox.checked;
            window.saveManager?.saveGame(false);
        });
        document.addEventListener('mousemove', event => this.moveHeldHelpers(event.clientX, event.clientY));
        document.addEventListener('mouseup', () => this.releaseHeldHelpers());
        document.addEventListener('touchmove', event => {
            if (!this._helperDrag || !event.touches.length) return;
            event.preventDefault();
            this.moveHeldHelpers(event.touches[0].clientX, event.touches[0].clientY);
        }, {passive: false});
        document.addEventListener('touchend', () => this.releaseHeldHelpers());
        document.addEventListener('touchcancel', () => this.releaseHeldHelpers(true));
        window.addEventListener('blur', () => this.releaseHeldHelpers(true));
        window.addEventListener('resize', () => {
            if (this.placedRick?.active) { this.updateDPS(); this.updateUI(true); }
        });
        window.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this._helperDrag) this.releaseHeldHelpers(true);
        });
    };

    proto.hideHelperGroupAction = function () {
        clearTimeout(this._helperGroupHoverTimer);
        clearTimeout(this._helperGroupHideTimer);
        this._helperGroupAction?.remove();
        this._helperGroupAction = null;
    };
    proto.clearHelperSelection = function () {
        this.hideHelperGroupAction();
        original.clearHelperSelection.call(this);
    };
    proto.scheduleHelperGroupAction = function (helper, sprite, immediate = false) {
        this.hideHelperGroupAction();
        const epoch = this._helperFieldEpoch;
        this._helperGroupHoverTimer = setTimeout(() => {
            if (epoch !== this._helperFieldEpoch || !sprite.isConnected || this._helperDrag || this.isPlacingHelpers || this.isBetaReportOpen) return;
            const members = helper.groupId ? this.getHelperGroupMembers(helper) : this.getSelectedHelperMembers(helper.type);
            if (members.length < 2) return;
            const button = document.createElement('button');
            button.className = 'helper-group-action';
            button.textContent = helper.groupId ? 'UNGROUP' : `GROUP ${members.length}`;
            button.style.left = `${helper.x + this.getHelperDisplaySize(helper.type) / 2}px`;
            button.style.top = `${helper.y + this.getHelperDisplaySize(helper.type) + 5}px`;
            button.addEventListener('mouseenter', () => clearTimeout(this._helperGroupHideTimer));
            button.addEventListener('mouseleave', () => {this._helperGroupHideTimer = setTimeout(() => this.hideHelperGroupAction(), 250);});
            button.addEventListener('mousedown', event => event.stopPropagation());
            button.addEventListener('click', event => {
                event.stopPropagation();
                helper.groupId ? this.ungroupHelpers(helper.groupId, helper.type) : this.groupHelpers(this.getSelectedHelperMembers(helper.type));
            });
            document.getElementById('helper-container').appendChild(button);
            this._helperGroupAction = button;
        }, immediate ? 0 : 2000);
    };

    // Separate DOM names need their own depth slot beside each sprite. Keep
    // the source order: resting < fading < hovered < held < group controls.
    proto.setHelperRestDepth = function (helper, sprite) {
        sprite.style.setProperty('--helper-rest-depth', Math.round(helper.y + this.getHelperDisplaySize(helper.type) / 2));
    };
    proto.showHelperHover = function (sprite, tooltip) {
        const previous = this._hoveredHelperSprite;
        if (previous && previous !== sprite) this.hideHelperHover(previous, previous._helperNameTooltip, true);
        this._hoveredHelperSprite = sprite;
        clearTimeout(sprite._helperNameFadeTimer);
        sprite.classList.remove('helper-hover-fading');
        sprite.classList.add('helper-hover-active');
        if (tooltip) {
            tooltip.style.visibility = 'visible'; tooltip.setAttribute('aria-hidden', 'false');
            tooltip.style.transition = 'none'; tooltip.style.opacity = '1';
            tooltip.style.zIndex = '200001';
        }
    };
    proto.hideHelperHover = function (sprite, tooltip, force = false) {
        if (sprite._helperMotion || (!force && (sprite._helperPointerOver || document.activeElement === sprite))) return;
        if (this._hoveredHelperSprite === sprite) this._hoveredHelperSprite = null;
        if (!sprite.classList.contains('helper-hover-active')) return;
        sprite.classList.remove('helper-hover-active');
        sprite.classList.add('helper-hover-fading');
        if (tooltip) {
            // Flush the immediate entry before beginning the independent fade.
            getComputedStyle(tooltip).opacity;
            tooltip.style.transition = reducedMotion() ? 'none' : 'opacity 1000ms ease-out';
            tooltip.style.opacity = '0'; tooltip.style.zIndex = '199999';
        }
        const finish = () => {
            sprite.classList.remove('helper-hover-fading'); sprite._helperNameFadeTimer = null;
            if (tooltip) { tooltip.style.visibility = 'hidden'; tooltip.setAttribute('aria-hidden', 'true'); }
            if (sprite._helperHoverRecord) this.setHelperRestDepth(sprite._helperHoverRecord, sprite);
        };
        clearTimeout(sprite._helperNameFadeTimer);
        if (reducedMotion()) finish();
        else sprite._helperNameFadeTimer = setTimeout(finish, 1000);
    };

    proto.createHelperSprite = function (helper) {
        if (!helper) return;
        const members = this.getHelperGroupMembers(helper);
        if (members[0] !== helper) return;
        original.createHelperSprite.call(this, helper);
        const sprite = document.querySelector(`.helper-sprite[data-helper-id="${helper.id}"]`);
        if (!sprite) return;
        sprite.draggable = false;
        sprite.tabIndex = 0;
        sprite.setAttribute('role', 'button');
        const tooltip = document.querySelector(`.helper-name-tooltip[data-helper-id="${helper.id}"]`);
        sprite._helperNameTooltip = tooltip; sprite._helperHoverRecord = helper;
        if (tooltip) { tooltip.style.visibility = 'hidden'; tooltip.setAttribute('aria-hidden', 'true'); }
        this.setHelperRestDepth(helper, sprite);
        const label = members.length > 1 ? `${helper.helper?.name || this.helperNames[helper.type] || helper.type} ×${members.length}` : helper.name || helper.helper?.name || helper.type;
        sprite.setAttribute('aria-label', label);
        if (tooltip) tooltip.textContent = label;
        const scale = this.getHelperGroupScale(members.length);
        sprite.style.setProperty('--helper-group-scale', scale);
        if (members.length > 1) sprite.classList.add('grouped-helper');
        sprite.addEventListener('mouseenter', () => {
            sprite._helperPointerOver = true; this.showHelperHover(sprite, tooltip);
            this.scheduleHelperGroupAction(helper, sprite);
        });
        sprite.addEventListener('mouseleave', () => {
            sprite._helperPointerOver = false; this.hideHelperHover(sprite, tooltip);
            clearTimeout(this._helperGroupHoverTimer);
            this._helperGroupHideTimer = setTimeout(() => this.hideHelperGroupAction(), 250);
        });
        sprite.addEventListener('focus', () => {
            this.showHelperHover(sprite, tooltip);
            this.scheduleHelperGroupAction(helper, sprite, true);
        });
        sprite.addEventListener('blur', () => {
            this.hideHelperHover(sprite, tooltip);
            this._helperGroupHideTimer = setTimeout(() => {if (!this._helperGroupAction?.contains(document.activeElement)) this.hideHelperGroupAction();}, 250);
        });
        sprite.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            if (helper.groupId) this.ungroupHelpers(helper.groupId, helper.type);
            else this.groupHelpers(this.getSelectedHelperMembers(helper.type));
        });
        this.startHelperMining(helper);
        return sprite;
    };
    proto.startHelperAnimation = function (helper, sprite) {
        this.stopHelperAnimation(sprite);
        original.startHelperAnimation.call(this, helper, sprite);
    };
    proto.refreshHelperField = function () {
        this.clearAllHelperSprites();
        for (const helper of this.placedHelpers) this.createHelperSprite(helper);
        this.updateHelperSelectionStyles();
        this.updateDPS();
    };
    proto.clearAllHelperSprites = function () {
        this.resetUpgradePresentation?.();
        this.releaseHeldHelpers?.(true);
        if (this.helpersOnCursor?.length || this.isPlacingHelpers) {
            this.helpersOnCursor = []; this.placementQueue = [];
            this.clearCursorSprites(); this.finishHelperPlacement();
        }
        for (const item of [...(this._helperDropMotions || [])]) this.finishHelperMotion(item);
        for (const sprite of document.querySelectorAll('#helper-container .helper-sprite')) clearTimeout(sprite._helperNameFadeTimer);
        this._hoveredHelperSprite = null;
        this.hideHelperGroupAction();
        this._helperFieldEpoch = (this._helperFieldEpoch || 0) + 1;
        this._helperGroupCache = null;
        document.querySelectorAll('#helper-container .helper-sprite').forEach(sprite => this.stopHelperAnimation(sprite));
        document.querySelectorAll('.helper-silhouette-shadow, .helper-flight, .helper-group-ghost').forEach(element => element.remove());
        original.clearAllHelperSprites.call(this);
    };

    function fieldGhost(sprite) {
        // Use the resting footprint throughout a purchase's scale-in animation.
        const parent=sprite.parentElement.getBoundingClientRect();
        const ratio=parent.width/(sprite.parentElement.offsetWidth||parent.width)||1;
        const scale=Number(sprite.style.getPropertyValue?.('--helper-group-scale'))||1;
        const rect={left:parent.left+((parseFloat(sprite.style.left)||0)-sprite.offsetWidth*(scale-1)/2)*ratio,
            top:parent.top+((parseFloat(sprite.style.top)||0)-sprite.offsetHeight*(scale-1)*.8)*ratio,
            width:sprite.offsetWidth*scale*ratio,height:sprite.offsetHeight*scale*ratio};
        const ghost=sprite.cloneNode(false);
        ghost.removeAttribute('data-helper-id');ghost.removeAttribute('tabindex');ghost.className='helper-group-ghost';
        Object.assign(ghost.style,{position:'fixed',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,transform:'none',animation:'none',opacity:'1'});
        return {ghost,rect};
    }
    proto.groupHelpers = function (records) {
        const members=[...new Set(records||[])].filter(helper=>this.placedHelpers.includes(helper));
        if(members.length<2||members.some(helper=>helper.type!==members[0].type)||this._helperDrag||this.isPlacingHelpers)return null;
        const size=this.getHelperDisplaySize(members[0].type);
        const center=this.findNearestValidSpot(members.reduce((n,h)=>n+h.x,0)/members.length,members.reduce((n,h)=>n+h.y,0)/members.length,size*this.getHelperGroupScale(members.length));
        const ghosts=[];
        for(const helper of members){const sprite=document.querySelector(`.helper-sprite[data-helper-id="${helper.id}"]`);if(sprite)ghosts.push(fieldGhost(sprite));}
        const groupId=`group_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        for(const helper of members){helper.groupId=groupId;helper.x=center.x;helper.y=center.y;}
        this.selectedHelperIds.clear();this.refreshHelperField();this.selectedHelperIds.add(members[0].id);this.updateHelperSelectionStyles();
        const result=document.querySelector(`.helper-sprite[data-helper-id="${members[0].id}"]`);
        if(result&&!reducedMotion()){
            result.classList.remove('place-bounce');
            const to=result.getBoundingClientRect(),scale=this.getHelperGroupScale(members.length);
            for(const {ghost,rect} of ghosts){document.body.appendChild(ghost);
                animate(ghost,[{left:`${rect.left}px`,top:`${rect.top}px`,transform:'scale(1)',opacity:1},
                    {left:`${to.left+(to.width-rect.width)/2}px`,top:`${to.top-16}px`,transform:'scale(.85)',opacity:.95,offset:.72},
                    {left:`${to.left+(to.width-rect.width)/2}px`,top:`${to.top}px`,transform:'scale(.3)',opacity:0}],520).then(()=>ghost.remove());}
            animate(result,[{transform:`scale(${scale*.5})`,opacity:0,offset:0},{transform:`scale(${scale*.5})`,opacity:0,offset:.65},
                {transform:`scale(${scale*1.12})`,opacity:1,offset:.88},{transform:`scale(${scale})`,opacity:1}],620);
        }
        window.saveManager?.saveGame(false);return groupId;
    };
    proto.ungroupHelpers = function (groupId,type) {
        const members=this.placedHelpers.filter(helper=>helper.groupId===groupId&&(!type||helper.type===type));
        if(members.length<2||this._helperDrag)return false;
        const source=document.querySelector(`.helper-sprite[data-helper-id="${members[0].id}"]`),origin=source?.getBoundingClientRect();
        const size=this.getHelperDisplaySize(members[0].type),point={x:members[0].x,y:members[0].y};
        const copies=source?members.map(()=>fieldGhost(source)):[];
        members.forEach((helper,index)=>{const angle=index*2.399963,radius=size*.8*Math.sqrt(index),p=this.findNearestValidSpot(point.x+Math.cos(angle)*radius,point.y+Math.sin(angle)*radius,size);helper.x=p.x;helper.y=p.y;delete helper.groupId;});
        this.selectedHelperIds.clear();this.refreshHelperField();
        members.forEach((helper,index)=>{
            const sprite=document.querySelector(`.helper-sprite[data-helper-id="${helper.id}"]`);if(!sprite||!origin||reducedMotion())return;
            sprite.classList.remove('place-bounce');const to=sprite.getBoundingClientRect(),{ghost}=copies[index];document.body.appendChild(ghost);
            animate(ghost,[{left:`${origin.left}px`,top:`${origin.top}px`,width:`${origin.width}px`,height:`${origin.height}px`,transform:'scale(.8)',opacity:1},
                {left:`${to.left}px`,top:`${to.top-12}px`,width:`${to.width}px`,height:`${to.height}px`,transform:'scale(1.06)',opacity:1,offset:.72},
                {left:`${to.left}px`,top:`${to.top}px`,width:`${to.width}px`,height:`${to.height}px`,transform:'scale(1)',opacity:0}],560).then(()=>ghost.remove());
            animate(sprite,[{opacity:0,offset:0},{opacity:0,offset:.84},{opacity:1,offset:1}],560);
        });
        window.saveManager?.saveGame(false);return true;
    };

    // DM2's time-based pendulum/bob integrator; substeps keep 60/120Hz alike.
    const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
    const newDangle = () => ({angle:0, angularVelocity:0, bob:0, bobVelocity:0, vx:0, vy:0});
    function stepDangle(state, dx, dy, seconds) {
        if (!(seconds > 0)) return;
        const stalled = seconds > .1, span = Math.min(seconds, .05);
        const ax = stalled ? 0 : clamp(dx / seconds, 1400), ay = stalled ? 0 : clamp(dy / seconds, 1400);
        if (stalled) state.vx = state.vy = 0;
        const steps = Math.ceil(span / (1 / 120)), dt = span / steps, follow = 1 - Math.exp(-dt / .045);
        for (let i=0; i<steps; i++) {
            const vx = state.vx + (ax - state.vx) * follow, vy = state.vy + (ay - state.vy) * follow;
            state.angularVelocity += .004 * (vx - state.vx);
            state.bobVelocity -= .024 * (vy - state.vy);
            state.vx = vx; state.vy = vy;
            state.angularVelocity += (.008 * vx - 120 * state.angle - 11 * state.angularVelocity) * dt;
            state.bobVelocity += (-160 * state.bob - 14 * state.bobVelocity) * dt;
            state.angle = clamp(state.angle + state.angularVelocity * dt, .16);
            state.bob = clamp(state.bob + state.bobVelocity * dt, 2.5);
            if (Math.abs(state.angle) === .16 && state.angle * state.angularVelocity > 0) state.angularVelocity = 0;
            if (Math.abs(state.bob) === 2.5 && state.bob * state.bobVelocity > 0) state.bobVelocity = 0;
        }
    }
    window.HelperMotion = {newDangle, stepDangle};
    const footprintCache = new Map();
    function footprint(image, width, height) {
        if (!image.naturalWidth) return {cx:width/2, foot:height};
        let bounds = footprintCache.get(image.src);
        if (!bounds) {
            try {
                const canvas=document.createElement('canvas'); canvas.width=96; canvas.height=96;
                const ctx=canvas.getContext?.('2d', {willReadFrequently:true});
                if (!ctx) return {cx:width/2,foot:height};
                const fit=96/Math.max(image.naturalWidth,image.naturalHeight);
                ctx.drawImage(image,(96-image.naturalWidth*fit)/2,(96-image.naturalHeight*fit)/2,image.naturalWidth*fit,image.naturalHeight*fit);
                const data=ctx.getImageData(0,0,96,96).data;
                let minX=96,maxX=0,maxY=0;
                for(let y=0;y<96;y++)for(let x=0;x<96;x++)if(data[(y*96+x)*4+3]>16){minX=Math.min(minX,x);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
                bounds={cx:(minX+maxX+1)/192,foot:(maxY+1)/96};footprintCache.set(image.src,bounds);
            } catch {return {cx:width/2,foot:height};}
        }
        return {cx:bounds.cx*width,foot:bounds.foot*height};
    }
    proto.makeHeldHelper = function (record, element, tip = null, scale = 1) {
        if (element._helperMotion) this.finishHelperMotion(element._helperMotion);
        if (tip) this.showHelperHover(element, tip);
        element.getAnimations?.().forEach(animation=>animation.cancel());
        element.classList.remove('place-bounce'); element.classList.add('helper-motion','helper-held');
        this.stopHelperAnimation(element);
        const width=element.offsetWidth || this.getHelperDisplaySize(record.type),height=element.offsetHeight || width;
        const shadow=element.cloneNode(false);shadow.removeAttribute('data-helper-id');shadow.removeAttribute('tabindex');
        shadow.className='helper-silhouette-shadow';shadow.style.width=`${width}px`;shadow.style.height=`${height}px`;
        document.getElementById('helper-container').appendChild(shadow);
        const paths=this.getHelperSpritePaths(record.type,this.helperUpgradeLevels?.[record.type]||0);
        let frame=false;
        const timer=setInterval(()=>{frame=!frame;element.src=frame?paths.mining:paths.idle;shadow.src=element.src;},105);
        const item={record,element,tip,shadow,timer,x:record.x,y:record.y,scale,width,height,footprint:footprint(element,width,height),
            dangle:newDangle(),lift:0,maxLift:Math.max(22,Math.min(44,height*scale*.45)),opacity:0,liftAt:performance.now(),compression:0};
        element._helperMotion=item;
        return item;
    };
    proto.paintHelperMotion = function (item,x,y) {
        const grow=1+.3*item.lift/item.maxLift, sx=item.scale*grow*(1+.5*item.compression),sy=item.scale*grow*(1-item.compression);
        const {cx,foot}=item.footprint, pivot=foot*.35;
        item.element.style.left=`${x}px`;item.element.style.top=`${y}px`;
        item.element.style.transformOrigin=`${cx}px ${pivot}px`;
        item.element.style.transform=`translateY(${-item.lift-(foot-pivot)*(sy-1)+item.dangle.bob}px) rotate(${item.dangle.angle}rad) scale(${sx},${sy})`;
        // Anchor the inverted silhouette to this sprite's actual feet; no type offsets.
        item.shadow.style.left=`${x}px`;item.shadow.style.top=`${y}px`;
        item.shadow.style.transformOrigin=`${cx}px ${foot}px`;
        item.shadow.style.transform=`scale(${item.scale*.86},${-item.scale*.86*.32})`;
        item.shadow.style.opacity=String(item.opacity*.3);
        this.positionHelperChatter?.(item.element,x+item.width/2,y-item.lift-38);
        if(item.tip){item.tip.style.opacity='1';item.tip.style.zIndex='400001';item.tip.style.left=`${x+cx}px`;item.tip.style.top=`${y-item.lift-24}px`;}
    };
    proto.finishHelperMotion = function (item) {
        cancelWorldFrame(item.dropFrame);clearInterval(item.timer);item.shadow.remove();
        this._helperDropMotions?.delete(item);
        if(item.element._helperMotion!==item)return;
        item.element._helperMotion=null;item.element.classList.remove('helper-motion','helper-held');
        item.element.style.transform='';item.element.style.transformOrigin='';
        if (item.tip) {
            this.setHelperRestDepth(item.record, item.element);
            if (item.element.matches(':hover') || document.activeElement === item.element) this.showHelperHover(item.element, item.tip);
            else this.hideHelperHover(item.element, item.tip, true);
        }
        if(item.element.isConnected)this.startHelperMining(item.record);
    };
    proto.dropHeldHelper = function (item,position) {
        clearInterval(item.timer);item.element.classList.remove('helper-held');
        this._helperDropMotions ||= new Set();this._helperDropMotions.add(item);
        if(!item.element.isConnected){this.finishHelperMotion(item);return;}
        const start=performance.now(),lift=item.lift,fall=Math.sqrt(2*lift/1800),release={...item.dangle},opacity=item.opacity;
        const tick=()=>{
            if(item.element._helperMotion!==item)return;
            const t=(performance.now()-start)/1000,u=fall?Math.min(1,t/fall):1;
            const h=(1-u)*(1-u)*(1+2*u),tangent=u*(1-u)*(1-u);
            item.dangle.angle=clamp(release.angle*h+release.angularVelocity*fall*tangent,.16);
            item.dangle.bob=clamp(release.bob*h+release.bobVelocity*fall*tangent,2.5);
            item.lift=Math.max(0,lift-900*t*t);
            item.compression=.065*Math.sqrt(lift/item.maxLift)*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-fall)/.16)));
            item.opacity=opacity*Math.pow(1-Math.min(1,t/.18),3);
            this.paintHelperMotion(item,position.x,position.y);
            if(t>=fall+.16){this.finishHelperMotion(item);return;}
            item.dropFrame=requestWorldFrame(tick);
        };
        tick();
    };
    proto.addDragAndDropToHelper = function (sprite, helper, tooltip) {
        const start=event=>{
            if(event.button>0||this._helperDrag||this.isPlacingHelpers||this.isBetaReportOpen||this.isTransitioning||!this.placedHelpers.includes(helper))return;
            const pointer=event.touches?.[0]||event;
            if(event.shiftKey&&!helper.groupId){this.selectedHelperIds.has(helper.id)?this.selectedHelperIds.delete(helper.id):this.selectedHelperIds.add(helper.id);this.updateHelperSelectionStyles();this.scheduleHelperGroupAction(helper,sprite);return;}
            event.preventDefault();event.stopPropagation();
            const selected=this.getSelectedHelperMembers(),selectedHere=selected.includes(helper);
            const members=selectedHere&&selected.length>1?selected:this.getHelperGroupMembers(helper);
            const visible=members.filter(record=>this.getHelperGroupMembers(record)[0]===record);
            if(!selectedHere)this.clearHelperSelection();this.hideHelperGroupAction();
            const field=document.getElementById('helper-container'),rect=field.getBoundingClientRect();
            this._helperDrag={x:pointer.clientX,y:pointer.clientY,lastX:pointer.clientX,lastY:pointer.clientY,
                frameX:0,frameY:0,lastAt:performance.now(),ratio:rect.width/(field.offsetWidth||rect.width)||1,moved:false,epoch:this._helperFieldEpoch,
                items:visible.map(record=>this.makeHeldHelper(record,document.querySelector(`.helper-sprite[data-helper-id="${record.id}"]`),
                    document.querySelector(`.helper-name-tooltip[data-helper-id="${record.id}"]`),this.getHelperGroupScale(this.getHelperGroupMembers(record).length)))};
            this.updateDPS();this.updateUI(true);
            this.beginHeldHelperChatter?.(this._helperDrag);
            field.classList.add('helpers-holding');this.renderHeldHelpers();window.GameCursor?.refresh(this);this.playSound('grabHelper');
            const tick=()=>{
                const drag=this._helperDrag;if(!drag)return;
                const now=performance.now(),dx=(drag.lastX-drag.x)/drag.ratio,dy=(drag.lastY-drag.y)/drag.ratio,dt=(now-drag.lastAt)/1000;
                for(const item of drag.items){stepDangle(item.dangle,dx-drag.frameX,dy-drag.frameY,dt);const u=Math.min(1,(now-item.liftAt)/200);item.lift=item.maxLift*(1-Math.pow(1-u,3));item.opacity=1-Math.pow(1-u,3);}
                drag.frameX=dx;drag.frameY=dy;drag.lastAt=now;this.renderHeldHelpers();drag.frame=requestWorldFrame(tick);
            };
            this._helperDrag.frame=requestWorldFrame(tick);
        };
        sprite.addEventListener('mousedown',start);sprite.addEventListener('touchstart',start,{passive:false});
    };
    proto.moveHeldHelpers = function (x,y) {
        const drag=this._helperDrag;if(!drag)return;
        drag.lastX=x;drag.lastY=y;drag.moved ||= Math.hypot(x-drag.x,y-drag.y)>3;
    };
    proto.renderHeldHelpers = function () {
        const drag=this._helperDrag;if(!drag)return;
        const dx=(drag.lastX-drag.x)/drag.ratio,dy=(drag.lastY-drag.y)/drag.ratio;
        for(const item of drag.items)this.paintHelperMotion(item,item.x+dx,item.y+dy);
    };
    proto.releaseHeldHelpers = function (cancel=false) {
        const drag=this._helperDrag;if(!drag)return;
        this.endHeldHelperChatter?.(drag,cancel);
        this._helperDrag=null;cancelWorldFrame(drag.frame);
        document.getElementById('helper-container')?.classList.remove('helpers-holding');
        for(const item of drag.items){
            const position=cancel||!drag.moved?{x:item.x,y:item.y}:this.findNearestValidSpot(item.x+(drag.lastX-drag.x)/drag.ratio,item.y+(drag.lastY-drag.y)/drag.ratio,this.getHelperDisplaySize(item.record.type)*item.scale);
            for(const member of this.getHelperGroupMembers(item.record)){member.x=position.x;member.y=position.y;}
            item.element.style.left=`${position.x}px`;item.element.style.top=`${position.y}px`;
            this.dropHeldHelper(item,position);
        }
        window.GameCursor?.refresh(this);
        this.updateDPS();this.updateUI(true);
        if(!cancel&&drag.moved)window.saveManager?.saveGame(false);
    };

    proto.findHelperClusterPosition = function (type) {
        const size = this.getHelperDisplaySize(type);
        const peers = this.placedHelpers.filter(helper => helper.type === type);
        const visible = peers.filter(helper => this.getHelperGroupMembers(helper)[0] === helper);
        let largest = [];
        for (const helper of visible) {
            const cluster = peers.filter(peer => Math.hypot(peer.x - helper.x, peer.y - helper.y) < size * 3);
            if (cluster.length > largest.length) largest = cluster;
        }
        const panel = document.getElementById('left-panel');
        const anchor = largest.length ? {x: largest.reduce((n, helper) => n + helper.x, 0) / largest.length,
            y: largest.reduce((n, helper) => n + helper.y, 0) / largest.length}
            : {x: panel.offsetWidth * (.2 + Math.random() * .55), y: panel.offsetHeight * (.28 + Math.random() * .38)};
        const seed = largest.length;
        const points = [];
        for (let index = seed; index < seed + 80; index++) {
            const radius = size * .55 * Math.sqrt(Math.max(1, index));
            const angle = index * 2.399963;
            const point = this.findNearestValidSpot(anchor.x + Math.cos(angle) * radius, anchor.y + Math.sin(angle) * radius, size);
            if (points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 3)) continue;
            points.push(point);
            if (!this.placedHelpers.some(helper => Math.hypot(helper.x - point.x, helper.y - point.y) < size * .55)) return point;
        }
        return points[0] || this.findNearestValidSpot(anchor.x, anchor.y, size);
    };
    proto.autoPlaceHelperDesktop = function (type, helper, ownedEntry = null) {
        const position = this.findHelperClusterPosition(type);
        const record = {type, helper, dps: helper.baseDps, ...position, id: Date.now() + Math.random(), isMining: false,
            name: ownedEntry?.name || helper.name || this.getHelperName(type)};
        this.placedHelpers.push(record);
        this.createHelperSprite(record);
        const sprite = document.querySelector(`.helper-sprite[data-helper-id="${record.id}"]`);
        const card = document.querySelector(`.shop-buy-btn[data-helper-type="${type}"]`)?.closest('.shop-grid-item');
        const source = card?.querySelector('.shop-item-sprite img');
        if (sprite && source && !reducedMotion()) {
            const from = source.getBoundingClientRect(), panel = document.getElementById('left-panel').getBoundingClientRect();
            const size = this.getHelperDisplaySize(type);
            const ghost = sprite.cloneNode(false); ghost.removeAttribute('data-helper-id'); ghost.removeAttribute('tabindex');
            ghost.className = 'helper-flight'; ghost.style.left = `${from.left}px`; ghost.style.top = `${from.top}px`;
            ghost.style.width = `${size}px`; ghost.style.height = `${size}px`; document.body.appendChild(ghost);
            const dx = panel.left + position.x - from.left, dy = panel.top + position.y - from.top;
            animate(ghost, [{transform: 'translate(0,0) scale(.65)', opacity: 1},
                {transform: `translate(${dx * .5}px,${dy * .5 - 60}px) scale(1.15)`, opacity: 1},
                {transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0}], 520).then(() => ghost.remove());
            animate(sprite, [{opacity: 0, offset: 0}, {opacity: 0, offset: .8}, {opacity: 1, offset: 1}], 520);
            animate(source, [{transform: 'scale(.2)', opacity: .3}, {transform: 'scale(1.12)', opacity: 1}, {transform: 'scale(1)', opacity: 1}], 240);
        }
        if (!this._bulkBuying) window.saveManager?.saveGame(false);
        if (type === 'spaceRocket' && !this.hasPlayedMoonLaunch && !this._bulkBuying) setTimeout(() => this.playMoonLaunchCutscene(), 540);
        return record;
    };
    proto.addHelperToCursor = function (type, helper, shouldStartPlacement = true, ownedEntry = null) {
        if (shouldStartPlacement && this.isMobileDevice()) return this.autoPlaceHelperMobile(type, helper);
        if (shouldStartPlacement && !this.isMobileDevice() && (this.autoPlaceHelpers !== false || this._bulkBuying)) return this.autoPlaceHelperDesktop(type, helper, ownedEntry);
        const result = original.addHelperToCursor.call(this, type, helper, shouldStartPlacement, ownedEntry);
        if (shouldStartPlacement && this.helpersOnCursor.length) {
            const pending = this.helpersOnCursor[this.helpersOnCursor.length - 1];
            const owned = this.getHelperArrayForLevel();
            pending.ownedEntry = [...owned].reverse().find(record => record.type === type);
            pending.purchaseCost = this.getHelperCost(helper.baseCost, owned.filter(record => record.type === type).length - 1, type);
        }
        window.GameCursor?.refresh(this);
        return result;
    };
    proto.cancelHelperPlacement = function () {
        const owned = this.getHelperArrayForLevel();
        for (const pending of [...this.helpersOnCursor].reverse()) {
            const index = pending.ownedEntry ? owned.indexOf(pending.ownedEntry) : owned.map(record => record.type).lastIndexOf(pending.type);
            if (index < 0) continue;
            this.dogecoins += Number.isFinite(pending.purchaseCost) ? pending.purchaseCost
                : this.getHelperCost(pending.helper.baseCost, owned.filter(record => record.type === pending.type).length - 1, pending.type);
            owned.splice(index, 1);
        }
        this.helpersOnCursor = [];
        this.clearCursorSprites();
        this.finishHelperPlacement();
        this.updateDPS(); this.updateUI();
        window.saveManager?.saveGame(false);
    };
    // Manual placement uses the same time-based lift, pendulum and footprint.
    proto.createCursorSprites = function () {
        original.createCursorSprites.call(this);
        const items=[];
        document.querySelectorAll('.helper-sprite.attached-to-mouse').forEach((sprite,index)=>{
            const data=this.helpersOnCursor[index];if(!data)return;
            const item=this.makeHeldHelper(data,sprite);sprite._heldMotion=item;items.push(item);
        });
        cancelWorldFrame(this._cursorLiftFrame);
        let lastAt=performance.now(),lastX=this.mouseX,lastY=this.mouseY;
        const tick=()=>{
            if(!items.some(item=>item.element.isConnected)){this._cursorLiftFrame=null;return;}
            const now=performance.now(),dt=(now-lastAt)/1000;
            for(const item of items){
                stepDangle(item.dangle,this.mouseX-lastX,this.mouseY-lastY,dt);
                const u=Math.min(1,(now-item.liftAt)/200);
                item.lift=item.maxLift*(1-Math.pow(1-u,3));item.opacity=1-Math.pow(1-u,3);
                this.paintHelperMotion(item,parseFloat(item.element.style.left)||0,parseFloat(item.element.style.top)||0);
            }
            lastX=this.mouseX;lastY=this.mouseY;lastAt=now;this._cursorLiftFrame=requestWorldFrame(tick);
        };
        this._cursorLiftFrame=requestWorldFrame(tick);
        document.getElementById('helper-container')?.classList.add('helpers-holding');window.GameCursor?.refresh(this);
    };
    proto.clearCursorSprites = function () {
        document.querySelectorAll('.helper-sprite.attached-to-mouse').forEach(sprite=>{if(sprite._heldMotion)this.finishHelperMotion(sprite._heldMotion);});
        original.clearCursorSprites.call(this);cancelWorldFrame(this._cursorLiftFrame);this._cursorLiftFrame=null;
        if(!this._helperDrag)document.getElementById('helper-container')?.classList.remove('helpers-holding');window.GameCursor?.refresh(this);
    };
})();
