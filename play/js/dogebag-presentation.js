// Persistent tier piles and DM2's batch burst -> receipts -> review -> claim flights.
(function () {
    'use strict';
    const requestWorldFrame=callback=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.request(callback):requestAnimationFrame(callback);
    const cancelWorldFrame=id=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.cancel(id):cancelAnimationFrame(id);
    const proto = DogeMinerGame.prototype;
    const planets = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const colors = {common:'#bababa', improved:'#40d545', rare:'#62b8e9', epic:'#ad69d7', legendary:'#efa938'};
    const bagColors = ['#66fd74','#495dff','#cb4abd','#fdb21d'];
    const motion = () => true; // Foreground opening is an explicit player interaction.
    const make = (tag, name, text) => {
        const node = document.createElement(tag); node.className = name;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const iconFor = reward => reward.item?.idleSprite || reward.item?.sprite ||
        (reward.type === 'diamonds' ? 'assets/general/diamond.webp' : 'assets/general/dogecoin_70x70.webp');
    function receiptPlan(rewards, phone) {
        const coins = [], diamonds = [], items = [];
        rewards.forEach((reward, index) => (reward.item ? items : reward.type === 'diamonds' ? diamonds : coins).push(index));
        const limit = phone ? 4 : 10, slots = [];
        if (coins.length) slots.push({ kind: 'coins', indices: coins });
        if (diamonds.length) slots.push({ kind: 'diamonds', indices: diamonds });
        items.slice(0, limit).forEach(index => slots.push({ kind: 'item', indices: [index] }));
        if (items.length > limit) slots.push({ kind: 'overflow', indices: items.slice(limit) });
        return slots;
    }
    const infoFor = planet => ({
        earth:['dogebag','Dogebag'], moon:['mooncrate','Moon Crate'], mars:['marschest','Mars Chest'],
        jupiter:['cloudcache','Cloud Cache'], titan:['titanbox','Titan Depot']
    })[planet] || ['dogebag','Dogebag'];
    function bagInfo(planet) {
        const [file,name] = infoFor(planet); return {sprite:'assets/general/icons/' + file + '.webp', name};
    }
    const countOf = bag => Math.max(1, Number(bag._dogebagCount) || 1);
    const validView = (game, view) => game._dogebagReveal === view && view.epoch === (game._currencyFlightEpoch || 0);
    function delay(view, fn, milliseconds) {view.timers.push(setTimeout(fn, milliseconds));}

    proto.layoutDogebagBackdrops = function (view) {
        const modal=document.getElementById('dogebag-modal');if(!modal)return;
        if(!view.backdrops)modal.querySelectorAll?.('.dogebag-backdrop').forEach(node=>node.remove());
        view.backdrops ||= [];
        const root=modal.getBoundingClientRect(),ratio=root.width/(modal.offsetWidth||root.width)||1;
        for(const panelId of ['left-panel','right-panel']){
            const panel=document.getElementById(panelId);if(!panel)continue;
            let backdrop=view.backdrops.find(node=>node.dataset.panel===panelId);
            if(!backdrop){backdrop=make('div','dogebag-backdrop');backdrop.dataset.panel=panelId;modal.prepend(backdrop);view.backdrops.push(backdrop);view.nodes.push(backdrop);}
            const rect=panel.getBoundingClientRect();
            backdrop.hidden=rect.width===0||rect.height===0;
            Object.assign(backdrop.style,{left:(rect.left-root.left)/ratio+'px',top:(rect.top-root.top)/ratio+'px',width:rect.width/ratio+'px',height:rect.height/ratio+'px',borderRadius:getComputedStyle(panel).borderRadius});
        }
    };
    proto.countDogebagCurrency = function (view,slot,amount) {
        cancelWorldFrame(slot.countFrame);
        const from=slot.shown,start=performance.now();slot.total+=amount;
        const target=slot.total;
        const tick=()=>{
            if(!validView(this,view)){slot.countFrame=null;return;}
            const t=Math.min(1,(performance.now()-start)/300);
            slot.shown=from+(target-from)*(1-(1-t)*(1-t));
            slot.value.textContent=this.formatNumber(Math.round(slot.shown));
            this.layoutDogebagTray(view);
            if(t<1)slot.countFrame=requestWorldFrame(tick);else{slot.shown=target;slot.countFrame=null;}
        };
        slot.countFrame=requestWorldFrame(tick);
    };
    proto.getDogebagStacksForSave = function () {
        const result = {};
        for (const planet of planets) {
            result[planet] = {};
            for (const [quality,count] of Object.entries(this.dogebagStacks?.[planet] || {}))
                if (/^[0-3]$/.test(quality) && Number.isFinite(count) && count > 0)
                    result[planet][quality] = Math.floor(count);
        }
        return result;
    };
    proto.restoreDogebagStacks = function (saved = {}) {
        this.dogebagStacks = {};
        for (const planet of planets) {
            this.dogebagStacks[planet] = {};
            for (const [quality,count] of Object.entries(saved?.[planet] || {}))
                if (/^[0-3]$/.test(quality) && Number.isFinite(count) && count > 0)
                    this.dogebagStacks[planet][quality] = Math.min(100000, Math.floor(count));
        }
        this._dogebagFieldPlanet = null;
        this.syncDogebagField();
    };
    proto.resetDogebagStacks = function () {this.restoreDogebagStacks({});};
    proto.getDogebagRestPosition = function (quality, polar) {
        const field=document.getElementById('rock-container'),rock=document.getElementById('main-rock'),panel=document.getElementById('left-panel');
        const rect=field.getBoundingClientRect(),area=panel?.getBoundingClientRect(),ratio=rect.width/(field.offsetWidth||rect.width)||1;
        const art=rock?.getBoundingClientRect()||rect;
        const positions=window.innerWidth<=768?[[225,153],[257,182],[281,180],[313,267]]:[[178,135],[212,229],[244,161],[238,290]];
        const coin = quality === 'coin';
        const phone=window.innerWidth<=768;
        const [degrees,radius]=coin ? polar || (phone ? [230+90*Math.random(),100+90*Math.random()] : [150+110*Math.random(),115+70*Math.random()])
            : quality==='diamond'?(phone?[302,203]:[134,159]):positions[quality]||positions[0],angle=degrees*Math.PI/180;
        // Keep source polar tier separation, fitted around CE's smaller rock.
        let x=(art.left+art.width/2-rect.left)/ratio+(Math.cos(angle)*radius-(phone?12:20))*.42;
        let y=(art.top+art.height/2-rect.top)/ratio+(Math.sin(angle)*radius+(phone?23:-20))*.42;
        if(area?.width&&area.height){
            const right=Math.min(area.right,window.innerWidth),bottom=Math.min(area.bottom,window.innerHeight||area.bottom);
            x=Math.max((area.left-rect.left)/ratio+58,Math.min(x,(right-rect.left)/ratio-58));
            y=Math.max((area.top-rect.top)/ratio+68,Math.min(y,(bottom-rect.top)/ratio-68));
        }
        return {x,y,polar:[degrees,radius],fromX:(art.left+art.width/2-rect.left)/ratio,fromY:(art.top+art.height/2-rect.top)/ratio};
    };
    proto.makeDogebagPile = function (planet,quality) {
        const info=bagInfo(planet),bag=make('div','dogebag-drop dogebag-stack'),wrapper=make('div','dogebag-img-wrapper'),body=make('div','dogebag-pile-body');
        bag.style.setProperty('--bag-color',bagColors[quality]||bagColors[0]);
        bag._dogebagRollOptions={planet,dropType:Number(quality)};bag._dogebagInfo=info;
        bag._dogebagGhosts=[];
        for(const [x,y,angle,threshold,tint] of [[19,-11,.21,3,.706],[-17,-6,-.17,2,.839]]){
            const ghost=make('img','dogebag-pile-copy');ghost.src=info.sprite;ghost.alt='';ghost.hidden=true;ghost.draggable=false;
            Object.assign(ghost.style,{transform:'translate('+x+'px,'+y+'px) rotate('+angle+'rad)',filter:'brightness('+tint+')'});
            body.appendChild(ghost);bag._dogebagGhosts.push({node:ghost,x,y,angle,threshold});
        }
        const image=make('img','dogebag-pile-main');image.src=info.sprite;image.alt=info.name;image.draggable=false;body.appendChild(image);
        wrapper.appendChild(body);bag.appendChild(wrapper);
        const badge=make('span','dogebag-stack-count');badge.hidden=true;wrapper.appendChild(badge);
        bag._dogebagBody=body;bag._dogebagBadge=badge;
        return bag;
    };
    proto.updateDogebagPile = function (bag,landed,animated=false) {
        const M=window.LootMotion,previous=bag._dogebagLandedCount||0;bag._dogebagLandedCount=landed;
        for(const ghost of bag._dogebagGhosts){
            const visible=landed>=ghost.threshold,appeared=visible&&ghost.node.hidden;ghost.node.hidden=!visible;
            if(animated&&appeared)M?.sample(ghost.node,320,t=>{const k=M.back(t,2.2);return{transform:'translate('+(ghost.x*(.3+.7*k))+'px,'+(ghost.y+14*(1-k))+'px) rotate('+(ghost.angle*k)+'rad)'};});
        }
        const badge=bag._dogebagBadge;badge.textContent='x'+landed;badge.hidden=landed<=1;
        bag.classList.toggle('dogebag-pile-full',landed>=99);
        if(landed>=99&&!bag._fullPulse)bag._fullPulse=setInterval(()=>{
            if(!bag.isConnected){clearInterval(bag._fullPulse);return;}
            M?.sample(bag._dogebagBody,550,t=>{const k=M.elastic(t,1.1,.4);return{transform:'scale('+(1+.072*(1-k))+','+(1-.081*(1-k))+')'};});
        },1800);
        bag.setAttribute('aria-label',bag._dogebagInfo.name+(bag._dogebagCount>1?' x'+bag._dogebagCount:''));
        if(animated&&landed>1&&previous!==landed)M?.sample(badge,350,t=>({scale:1.5-.5*M.back(t,3)}));
        if(animated)M?.sample(bag._dogebagBody,550,t=>{const k=M.elastic(t,1.1,.4);return{transform:'scale('+(1+.16*(1-k))+','+(1-.18*(1-k))+')'};});
    };
    proto.renderDogebagStack = function (planet,quality,count,spawning=false) {
        const field=document.getElementById('rock-container');if(!field||!(count>0))return null;
        const bag=this.makeDogebagPile(planet,quality),position=this.getDogebagRestPosition(quality);
        bag._dogebagCount=count;bag._dogebagRest=position;bag.setAttribute('role','button');bag.tabIndex=0;
        bag.style.left=position.x+'px';bag.style.top=position.y+'px';
        const open=event=>{event.stopPropagation();bag._lootHover?.reset();this.openDogebagModal(bag);};
        bag.addEventListener('click',open);bag.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open(event);}});
        field.appendChild(bag);
        if(window.innerWidth>768)bag._lootHover=window.LootMotion?.hover(bag,bag.querySelector('.dogebag-img-wrapper'));
        this.updateDogebagPile(bag,spawning?0:count);
        if(spawning)this.spawnDogebagToPile(bag,bag,true);else bag.classList.add('dogebag-settled');
        return bag;
    };
    proto.spawnDogebagToPile = function (pile,sprite,first=false) {
        const M=window.LootMotion,p=pile._dogebagRest,fromX=p.fromX,fromY=p.fromY;
        const endX=p.x+(first?0:Math.round(16*(Math.random()-.5))),endY=p.y-(first?0:6);
        sprite.style.left=endX+'px';sprite.style.top=endY+'px';
        const arrive=()=>{
            if(!pile.isConnected||pile._dogebagRollOptions.planet!==this.currentLevel){if(!first)sprite.remove();return;}
            if(first)pile.classList.add('dogebag-settled');else sprite.remove();
            this.updateDogebagPile(pile,Math.min(pile._dogebagCount,(pile._dogebagLandedCount||0)+1),true);
        };
        const value=t=>{const e=t===1?1:1-Math.pow(2,-10*t),fade=Math.min(1,t*4);return{transform:'translate(calc(-50% + '+((fromX-endX)*(1-e))+'px),calc(-50% + '+((fromY-endY)*(1-e))+'px))',opacity:1-(1-fade)*(1-fade)};};
        if(M)M.sample(sprite,800,value,arrive);else{Object.assign(sprite.style,value(1));arrive();}
    };
    proto.syncDogebagField = function () {
        if(this._dogebagFieldPlanet===this.currentLevel)return;
        document.querySelectorAll('.dogebag-drop,.dogebag-field-flight').forEach(bag=>{clearInterval(bag._fullPulse);bag._lootHover?.detach();bag.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());bag.remove();});
        this._dogebagFieldPlanet=this.currentLevel;
        for(const [quality,count] of Object.entries(this.dogebagStacks?.[this.currentLevel]||{}))this.renderDogebagStack(this.currentLevel,quality,count);
    };
    proto.createDogebag = function () {
        this.syncDogebagField();
        const pool=window.DogeMinerBalance?.getNaturalLootPool(this,{planet:this.currentLevel}),quality=pool?.dropType||0;
        this.dogebagStacks ||= {};this.dogebagStacks[this.currentLevel] ||= {};
        const counts=this.dogebagStacks[this.currentLevel];counts[quality]=(counts[quality]||0)+1;
        const pile=[...document.querySelectorAll('.dogebag-stack')].find(bag=>bag._dogebagRollOptions.planet===this.currentLevel&&bag._dogebagRollOptions.dropType===quality);
        if(pile){pile._dogebagCount=counts[quality];const flight=this.makeDogebagPile(this.currentLevel,quality);flight.className='dogebag-field-flight';document.getElementById('rock-container').appendChild(flight);this.spawnDogebagToPile(pile,flight);}
        else this.renderDogebagStack(this.currentLevel,quality,counts[quality],true);
        this.playSound('woof');this._showHappyDoge();window.saveManager?.saveGame(false);
    };
    proto.grantDogebagReward = function (reward) {
        if (reward.type === 'pickaxe') this.addPickaxeToInventory(reward.item);
        else if (reward.type === 'fortune') {
            this.addFortuneToInventory(reward.item);
            if (reward.item.name === 'Mystery Box') {this.noteMysteryBoxFound?.(); this.mysteryBoxObtained = true; this.initMysteryBox();}
            this.setLatestObtainedFortune(reward.item); this.recalculatePlayerStats();
        } else if (reward.type === 'coins') {
            this.dogecoins += reward.amount; this.totalMined += reward.amount;
            this.pendingCoinDisplayAmount = (this.pendingCoinDisplayAmount || 0) + reward.amount;
        } else if (reward.type === 'diamonds') {
            this.dogediamonds += reward.amount; this.dogediamondsEverObtained += reward.amount;
            this.pendingDiamondDisplayAmount = (this.pendingDiamondDisplayAmount || 0) + reward.amount;
        }
    };
    proto.openDogebagModal = function (bag) {
        if (this._dogebagReveal || !bag || this.isBetaReportOpen || this.isTransitioning) return;
        const options = bag._dogebagRollOptions || {planet:this.currentLevel,dropType:0};
        const bags = [...document.querySelectorAll('.dogebag-drop')].filter(other => other === bag ||
            (other._dogebagRollOptions?.planet || this.currentLevel) === options.planet);
        if (!bags.includes(bag)) bags.unshift(bag);
        const view = this._dogebagReveal = {bags,options,opened:false,epoch:this._currencyFlightEpoch || 0,
            rewards:[],reviewed:new Set(),selected:0,coins:0,diamonds:0,nodes:[],timers:[],
            firstDiamonds:this.dogediamondsEverObtained === 0,previousFocus:document.activeElement};
        for(const fieldBag of bags){fieldBag._lootHover?.reset();if(fieldBag._dogebagBody)this.updateDogebagPile(fieldBag,countOf(fieldBag));}
        document.querySelectorAll('.dogebag-field-flight').forEach(node=>{node.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());node.remove();});
        this.releaseHeldHelpers?.(true);
        const modal = document.getElementById('dogebag-modal');
        if (!modal) return;
        modal.dataset.lootKind='bag';modal.classList.remove('closing'); modal.classList.add('active');
        view.resize = () => {this.layoutDogebagBackdrops(view);this.layoutDogebagTray(view);};
        this.layoutDogebagBackdrops(view);
        window.addEventListener('resize',view.resize);
        modal.style.setProperty('--bag-color',bagColors[options.dropType] || bagColors[0]);
        document.getElementById('dogebag-state-reveal').hidden = true;
        document.getElementById('dogebag-reward-tray').replaceChildren();
        document.getElementById('dogebag-burst-bag').src = bag._dogebagInfo?.sprite || bagInfo(options.planet).sprite;
        document.getElementById('dogebag-burst-count').textContent = '×' + bags.reduce((n,b) => n+countOf(b),0);
        document.getElementById('dogebag-burst-stage').classList.remove('finished');
        Object.assign(document.getElementById('dogebag-burst-stage').style,{opacity:'',transform:''});
        document.getElementById('dogebag-burst-title').textContent = bagInfo(options.planet).name.toUpperCase() + ' CONTAINED:';
        const summary=document.getElementById('dogebag-batch-summary');
        if(summary){const total=bags.reduce((n,b)=>n+countOf(b),0);summary.hidden=false;summary.textContent=total+' '+(total===1?'bag':'bags')+' ready to open';}
        document.getElementById('mystery-loot-prompt')?.setAttribute('hidden','');
        const prompt = document.getElementById('dogebag-state-prompt');
        prompt.hidden = this.hasSeenDogebagIntro;
        view.keyHandler = event => {
            event.stopImmediatePropagation();
            if (event.key === 'Escape') {event.preventDefault(); this.closeDogebagModal();}
            else if (event.key === 'Tab') {
                const buttons = [...modal.querySelectorAll('button')].filter(button => !button.disabled && button.getClientRects().length);
                const index = buttons.indexOf(document.activeElement);
                if (buttons.length && (index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === buttons.length-1)) {
                    event.preventDefault(); buttons[event.shiftKey ? buttons.length-1 : 0].focus();
                }
            }
        };
        document.addEventListener('keydown',view.keyHandler,true);
        if (this.hasSeenDogebagIntro) this.openDogebagContents();
        else {
            this.hasSeenDogebagIntro = true;
            window.saveManager?.saveGame(false);
            prompt.querySelector('button')?.focus({preventScroll:true});
        }
    };
    proto.openDogebagContents = function () {
        const view = this._dogebagReveal;
        if (!view || view.opened) return;
        view.opened = true;
        let granted = 0;
        const consumed = {};
        for (const bag of view.bags) {
            let remaining = countOf(bag);
            while (remaining > 0) {
                const reward = bag._dogebagContents || this.generateDogebagContents(bag._dogebagRollOptions);
                if (!reward) break;
                bag._dogebagContents = null;
                this.grantDogebagReward(reward);
                view.rewards.push(reward); remaining--; granted++;
                const quality=bag._dogebagRollOptions?.dropType ?? view.options.dropType;
                consumed[quality]=(consumed[quality]||0)+1;
                if (reward.type === 'coins') view.coins += reward.amount;
                if (reward.type === 'diamonds') view.diamonds += reward.amount;
            }
            bag._dogebagCount = remaining;
            if (!remaining) {clearInterval(bag._fullPulse);bag._lootHover?.detach();bag.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());bag.remove();}
            else if (bag.querySelector('.dogebag-stack-count')) bag.querySelector('.dogebag-stack-count').textContent = '×' + remaining;
        }
        if (this.dogebagStacks?.[view.options.planet]) for(const [quality,count] of Object.entries(consumed))
            this.dogebagStacks[view.options.planet][quality]=Math.max(0,(this.dogebagStacks[view.options.planet][quality]||count)-count);
        this.updateUI(); window.saveManager?.saveGame(false);
        this.presentDogebagRewards(view);
    };
    proto.presentDogebagRewards = function (view) {
        const modal = document.getElementById('dogebag-modal'), tray = document.getElementById('dogebag-reward-tray');
        if (!modal || !tray || !view.rewards.length) {this.closeDogebagModal(); return;}
        const summary=document.getElementById('dogebag-batch-summary');
        if(summary){
            const total=view.rewards.length,items=view.rewards.filter(reward=>reward.item).length,currency=total-items;
            summary.hidden=view.kind==='mystery';
            summary.textContent=total+' '+(total===1?'bag':'bags')+' opened · '+items+' '+(items===1?'item':'items')+' + '+currency+' currency '+(currency===1?'reward':'rewards');
        }
        document.getElementById('dogebag-state-prompt').hidden = true;
        view.tray = tray; view.slots = []; view.receipts = []; view.arrived = new Set(); view.launched = new Set();
        this.rebuildDogebagTray(view);
        this.layoutDogebagTray(view);
        if (!motion()) {this.finishDogebagBurst(view); return;}
        if(view.kind==='mystery'){this.animateMysteryBoxOpening(view);return;}
        const stage = document.getElementById('dogebag-burst-stage');
        stage.animate?.([{opacity:0,translate:'-100px 0'},{opacity:1,translate:'0 0'}],{duration:450,easing:'cubic-bezier(.18,.9,.25,1.15)'});
        let offset = 0, wave = 0, lastFlight = 0;
        const emit = () => {
            if (!validView(this,view)) return;
            const size = wave < 3 ? 1 : Math.min(40,Math.ceil(Math.pow(1.45,wave-2)));
            const end = Math.min(view.rewards.length,offset+size);
            document.getElementById('dogebag-burst-count').textContent = '×' + (view.rewards.length-end);
            document.getElementById('dogebag-burst-bag').animate?.(
                [{scale:1},{scale:.8,rotate:'-5deg'},{scale:1.06,rotate:'3deg'},{scale:1,rotate:'0deg'}],
                {duration:220,easing:'ease-out'});
            for (let i=offset; i<end; i++) {
                const index = i;
                delay(view,() => this.flyDogebagReceipt(view,index), (i-offset)*35);
                lastFlight = Math.max(lastFlight,performance.now()+(i-offset)*35+340);
            }
            offset=end;wave++;
            if (offset<view.rewards.length) delay(view,emit,110);
            else delay(view,() => this.finishDogebagBurst(view),Math.max(0,lastFlight-performance.now())+500);
        };
        delay(view,emit,570);
    };
    proto.rebuildDogebagTray = function (view) {
        const phone = window.innerWidth <= 768;
        const focused = view.tray.contains(document.activeElement);
        for (const slot of view.slots || []) cancelWorldFrame(slot.countFrame);
        view.tray.replaceChildren(); view.slots = []; view.receipts = []; view.trayPhone = phone;
        for (const group of receiptPlan(view.rewards, phone)) {
            const reward = view.rewards[group.indices[0]], overflow = group.kind === 'overflow';
            const button = make('button', 'dogebag-reward-mini' + (overflow ? ' dogebag-reward-overflow' : ''));
            button.type = 'button'; button.disabled = !view.ready;
            const image = overflow ? make('span', '', '+0') : make('img', '');
            if (!overflow) { image.src = iconFor(reward); image.alt = ''; }
            button.append(image);
            const value = !reward.item ? make('span', '', '0') : null; if (value) button.append(value);
            const slot = { button, image, value, indices: group.indices, overflow, shown: 0, total: 0, countFrame: null };
            button.style.setProperty('--reward-color', colors[reward.item?.rarity] || '#c58736');
            button.setAttribute('aria-label', overflow ? `${group.indices.length} more items; review remaining loot` : reward.item?.name || reward.type);
            button.addEventListener('click', () => {
                if (view.ready) this.showDogebagReward(slot.indices.find(index => !view.reviewed.has(index)) ?? slot.indices[0]);
            });
            const arrived = group.indices.filter(index => view.ready || view.arrived.has(index));
            if (value) { slot.shown = slot.total = arrived.reduce((sum, index) => sum + view.rewards[index].amount, 0); value.textContent = this.formatNumber(slot.total); }
            if (overflow) image.textContent = '+' + arrived.length;
            button.hidden = !view.ready && !group.indices.some(index => view.launched.has(index));
            button.classList.toggle('arrived', view.ready || arrived.length > 0);
            button.classList.toggle('selected', group.indices.includes(view.selected));
            button.classList.toggle('reviewed', group.indices.every(index => view.reviewed.has(index)));
            for (const index of group.indices) view.receipts[index] = button;
            view.slots.push(slot); view.tray.append(button);
        }
        if (focused) view.receipts[view.selected]?.focus({ preventScroll: true });
    };
    proto.layoutDogebagTray = function (view) {
        if (!view.tray) return;
        if (view.trayPhone !== (window.innerWidth <= 768)) this.rebuildDogebagTray(view);
        const width = view.tray.scrollWidth || view.tray.offsetWidth;
        const available = Math.max(100, (view.tray.closest('.dogebag-scene')?.clientWidth || window.innerWidth) - 32);
        view.tray.style.setProperty('--tray-scale',Math.min(1,available/Math.max(1,width)));
    };
    proto.flyDogebagReceipt = function (view,index) {
        if (!validView(this,view)) return;
        const reward=view.rewards[index],button=view.receipts[index],slot=view.slots.find(slot=>slot.button===button);
        view.launched.add(index);
        button.hidden=false;this.layoutDogebagTray(view);
        const from=document.getElementById('dogebag-burst-bag').getBoundingClientRect();
        const ghost=make('img','dogebag-flight');ghost.src=iconFor(reward);ghost.alt='';
        ghost.style.setProperty('--reward-color',colors[reward.item?.rarity] || '#c58736');
        document.body.appendChild(ghost);view.nodes.push(ghost);
        const begin={x:from.left+from.width/2-22,y:from.top+from.height/2-22};
        ghost.style.left=begin.x+'px';ghost.style.top=begin.y+'px';
        const start=performance.now(),bend=60*(Math.random()-.5),apex=70+40*Math.random();
        const arrive=()=>{
            ghost.remove();if(!validView(this,view))return;
            view.arrived.add(index);
            const current = view.slots.find(slot => slot.button === view.receipts[index]);
            current.button.classList.add('arrived');
            if(current.value)this.countDogebagCurrency(view,current,reward.amount);
            if(current.overflow)current.image.textContent = '+' + current.indices.filter(index => view.arrived.has(index)).length;
            current.button.animate?.([{scale:.6},{scale:1.2},{scale:1}],{duration:320,easing:'ease-out'});
        };
        const tick=()=>{
            if(!validView(this,view)||!ghost.isConnected)return;
            const progress=Math.min(1,(performance.now()-start)/340),t=1-Math.cos(progress*Math.PI/2),u=1-t;
            // Newly arrived receipts recenter the strip; follow the live icon.
            const current=view.slots.find(slot=>slot.button===view.receipts[index]);
            const to=current.image.getBoundingClientRect(),end={x:to.left+to.width/2-22,y:to.top+to.height/2-22};
            const control={x:(begin.x+end.x)/2+bend,y:Math.min(begin.y,end.y)-apex};
            const x=u*u*begin.x+2*u*t*control.x+t*t*end.x,y=u*u*begin.y+2*u*t*control.y+t*t*end.y;
            ghost.style.transform='translate('+(x-begin.x)+'px,'+(y-begin.y)+'px) rotate('+(t*.6)+'rad) scale('+(1.25-.35*t)+')';
            if(progress<1)ghost._dogebagFlightFrame=requestWorldFrame(tick);else arrive();
        };
        tick();
        delay(view,() => ghost.remove(),800);
    };
    proto.finishDogebagBurst = function (view) {
        if (!validView(this,view)) return;
        view.ready = true;
        for (const slot of view.slots) {
            slot.button.hidden=false;slot.button.disabled = false; slot.button.classList.add('arrived');
            if (slot.value) {
                const total=slot.indices.reduce((n,i)=>n+view.rewards[i].amount,0);
                if(!slot.countFrame){slot.total=slot.shown=total;slot.value.textContent=this.formatNumber(total);}
            }
            if (slot.overflow) slot.image.textContent = '+' + slot.indices.length;
        }
        this.layoutDogebagTray(view);
        document.getElementById('dogebag-burst-stage').classList.add('finished');
        document.getElementById('dogebag-modal').classList.toggle('mystery-review',view.kind==='mystery');
        const first=view.rewards.findIndex(reward=>reward.item);
        this.showDogebagReward(Math.max(0,first));
    };
    proto.showDogebagReward = function (index) {
        const view=this._dogebagReveal;if(!view?.opened||!view.rewards[index])return;
        view.selected=index;
        const reward=view.rewards[index],reveal=document.getElementById('dogebag-state-reveal');
        if(!reveal)return;
        reveal.hidden=false;
        document.getElementById('dogebag-item-name').className='dogebag-item-name';
        if(reward.type==='pickaxe')this._renderDogebagPickaxe(reward.item);
        else if(reward.type==='fortune')this._renderDogebagFortune(reward.item);
        else {
            const slot=(view.slots||[]).find(slot=>slot.indices.includes(index));
            const total=slot?slot.indices.reduce((n,i)=>n+view.rewards[i].amount,0):reward.amount;
            const display=document.getElementById('dogebag-currency-display');
            display.replaceChildren();
            const image=make('img','');image.src=iconFor(reward);image.alt='';
            display.append(image,make('span','',this.formatNumber(total)+(reward.type==='diamonds'?' Dogediamonds':' Dogecoins')));
            const actions=document.getElementById('dogebag-actions');actions.replaceChildren();
            const loot=make('button','dogebag-action-btn loot-btn','LOOT');loot.type='button';loot.addEventListener('click',()=>this.dogebagLoot());actions.appendChild(loot);
        }
        reveal.dataset.kind=reward.type;
        reveal.style.setProperty('--reward-color',colors[reward.item?.rarity] || '#d6ad4b');
        for(const slot of view.slots || [])slot.button.classList.toggle('selected',slot.indices.includes(index));
        const content=reveal.querySelector(reward.item?'.dogebag-prize-layout':'#dogebag-currency-display');
        const receipt=view.receipts[index];
        if(content&&receipt&&content.animate){
            const from=receipt.getBoundingClientRect(),to=content.getBoundingClientRect();
            const dx=from.left+from.width/2-to.left-to.width/2,dy=from.top+from.height/2-to.top-to.height/2;
            content.getAnimations().forEach(animation=>animation.cancel());
            content.animate([{transform:'translate('+dx+'px,'+dy+'px) scale(.15)',opacity:0},
                {transform:'translate(0,-8px) scale(1.04)',opacity:1,offset:.82},{transform:'translate(0,0) scale(1)',opacity:1}],
                {duration:320,easing:'cubic-bezier(.18,.9,.25,1.15)'});
        }
        reveal.querySelector('.loot-btn')?.focus({preventScroll:true});
    };
    proto.advanceDogebagReward = function () {
        const view=this._dogebagReveal;if(!view?.ready)return;
        view.reviewed.add(view.selected);
        const slot = view.slots.find(slot => slot.indices.includes(view.selected));
        slot?.button.classList.toggle('reviewed', slot.indices.every(index => view.reviewed.has(index)));
        // Currency is already shown as totals in the tray; review each item card.
        const next=view.rewards.findIndex((reward,index)=>reward.item&&!view.reviewed.has(index));
        if(next<0)this.closeDogebagModal();else this.showDogebagReward(next);
    };
    proto.dogebagLoot = function () {if(this._dogebagReveal?.ready){this.playSound('collectItem');this.advanceDogebagReward();}};
    proto.dogebagEquip = function () {
        const view=this._dogebagReveal,reward=view?.rewards[view.selected];
        if(!view?.ready||reward?.type!=='pickaxe')return;
        this.equipPickaxe(reward.item.instanceId);window.saveManager?.saveGame(false);
        this.playSound('receivePickaxe');this.advanceDogebagReward();
    };
    proto.flyDogebagItemToInventory = function (slot,view) {
        const reward=view.rewards[slot.indices[0]];if(!reward.item||!motion())return;
        const target=document.getElementById(reward.type==='pickaxe'?'pickaxe-btn':'fortune-btn');
        if(!target)return;
        const from=slot.image.getBoundingClientRect(),to=target.getBoundingClientRect();
        const ghost=make('img','dogebag-flight dogebag-claim-flight');ghost.src=iconFor(reward);ghost.alt='';
        ghost.style.setProperty('--reward-color',colors[reward.item?.rarity] || '#c58736');
        document.body.appendChild(ghost);
        const start={x:from.left,y:from.top},end={x:to.left+to.width/2-22,y:to.top+to.height/2-22},cy=Math.min(start.y,end.y)-80;
        const frames=Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return {left:(u*u*start.x+2*u*t*(start.x+end.x)/2+t*t*end.x)+'px',
            top:(u*u*start.y+2*u*t*cy+t*t*end.y)+'px',transform:'scale('+(1-.35*t)+')',opacity:t>.75?(1-t)/.25:1};});
        const animation=ghost.animate?.(frames,{duration:650,easing:'ease-in'});
        if(animation)animation.onfinish=()=>{ghost.remove();target.animate?.([{scale:1},{scale:1.12},{scale:1}],{duration:250});};
        setTimeout(()=>ghost.remove(),900);
    };
    proto.closeDogebagModal = function () {
        const view=this._dogebagReveal;if(!view)return;
        // Closing during the burst still claims from the bottom receipt strip.
        for(const slot of view.slots||[]){slot.button.hidden=false;slot.button.classList.add('arrived');if(slot.overflow)slot.image.textContent='+'+slot.indices.length;}
        this.layoutDogebagTray(view);
        this._dogebagReveal=null;
        window.removeEventListener('resize',view.resize);
        for(const slot of view.slots||[])cancelWorldFrame(slot.countFrame);
        document.removeEventListener('keydown',view.keyHandler,true);
        for(const timer of view.timers)clearTimeout(timer);
        const anchor=view.tray?.getBoundingClientRect();
        if(view.epoch===(this._currencyFlightEpoch||0)){
            for(const slot of view.slots || [])this.flyDogebagItemToInventory(slot,view);
            const event=anchor?{clientX:anchor.left+anchor.width/2,clientY:anchor.top+anchor.height/2}:null;
            if(view.coins>0){this.pendingCoinDisplayAmount=Math.max(0,this.pendingCoinDisplayAmount-view.coins);this.createFloatingCoin(view.coins,event);}
            if(view.diamonds>0){
                this.pendingDiamondDisplayAmount=Math.max(0,this.pendingDiamondDisplayAmount-view.diamonds);this.createFloatingDiamond(view.diamonds,event);
                if(view.firstDiamonds)setTimeout(()=>{if(view.epoch===(this._currencyFlightEpoch||0)&&!this._dogebagReveal&&!this.isBetaReportOpen&&!this.isCutscenePlaying)this.showDiamondIntro();},900);
            }
        }
        for(const node of view.nodes){cancelWorldFrame(node._dogebagFlightFrame);if(!view.backdrops?.includes(node))node.remove();}
        const modal=document.getElementById('dogebag-modal');
        modal?.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());
        modal?.classList.remove('mystery-review');modal?.classList.add('closing');
        const close=()=>{if(!this._dogebagReveal)modal?.classList.remove('active','closing','mystery-review');};
        if(motion())setTimeout(close,500);else close();
        this._currentDogebag=null;this._dogebagPendingItem=null;this._pendingMysteryBoxRewards=null;
        window.saveManager?.saveGame(false);this.updateUI();
        view.previousFocus?.isConnected && view.previousFocus.focus?.({preventScroll:true});
    };
    proto.resetDogebagPresentation = function () {
        const view=this._dogebagReveal;
        this._dogebagReveal=null;
        if(view){window.removeEventListener('resize',view.resize);for(const slot of view.slots||[])cancelWorldFrame(slot.countFrame);document.removeEventListener('keydown',view.keyHandler,true);for(const timer of view.timers)clearTimeout(timer);for(const node of view.nodes){cancelWorldFrame(node._dogebagFlightFrame);node.remove();}}
        const modal=document.getElementById('dogebag-modal');modal?.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());
        modal?.classList.remove('active','closing','mystery-review');
        document.querySelectorAll('.dogebag-flight').forEach(node=>node.remove());
        this._currentDogebag=null;this._dogebagPendingItem=null;this._pendingMysteryBoxRewards=null;
    };
    window.DogeMinerLootReceipts = Object.freeze({ receiptPlan });
})();
