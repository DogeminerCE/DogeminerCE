// Persistent groups must preserve ownership, names, IDs and income, including reload.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../play/js');
const timers = [];
let nextTimer = 0;
class Element {
    constructor(tag = 'div') {
        this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.events = {};
        this.style = {setProperty(name, value) {this[name] = value;}};
        this.className = ''; this.attributes = {}; this.offsetWidth = 60; this.offsetHeight = 60;
        this.classList = {add: (...names) => {this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' ');},
            remove: (...names) => {this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' ');},
            contains: name => this.className.split(' ').includes(name), toggle: (name, on) => on ? this.classList.add(name) : this.classList.remove(name)};
    }
    appendChild(child) {child.remove(); child.parentNode = this; this.children.push(child); return child;}
    append(...children) {children.forEach(child => this.appendChild(child));}
    remove() {if(this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null;}
    get isConnected() {return !!this.parentNode;}
    get parentElement() {return this.parentNode;}
    setAttribute(key, value) {this.attributes[key] = String(value);}
    removeAttribute(key) {delete this.attributes[key]; if(key === 'data-helper-id') delete this.dataset.helperId;}
    getAttribute(key) {return key === 'data-helper-id' ? this.dataset.helperId : this.attributes[key];}
    addEventListener(type, fn) {(this.events[type] ||= []).push(fn);}
    cloneNode() {const clone = new Element(this.tagName); clone.className = this.className; clone.src = this.src; Object.assign(clone.style, this.style); Object.assign(clone.dataset, this.dataset); return clone;}
    querySelector(selector) {const visit = node => {for (const child of node.children) {if (matches(child,selector)) return child; const found = visit(child); if(found) return found;} return null;}; return visit(this);}
    matches(selector) {return selector === ':hover' ? false : matches(this, selector);}
    closest(selector) { let node=this; while(node){ if(matches(node,selector))return node; node=node.parentNode; } return null; }
    getBoundingClientRect() {return {left:0, top:0, width:this.offsetWidth, height:this.offsetHeight};}
    contains(element) {return element === this || this.children.some(child => child.contains(element));}
}
const body = new Element();
const field = new Element(); body.appendChild(field);
const panel = new Element(); panel.offsetWidth = 800; panel.offsetHeight = 600;
const all = () => {const result = []; const visit = node => {result.push(node); node.children.forEach(visit);}; visit(body); return result;};
const matches = (node, selector) => {
    const id = selector.match(/data-helper-id="([^"]+)"/);
    if (id && String(node.dataset.helperId) !== id[1]) return false;
    if (selector.includes('data-helper-id') && node.dataset.helperId === undefined) return false;
    return [...selector.matchAll(/\.([a-z-]+)/g)].every(match => node.classList.contains(match[1]));
};
const doc = {body, activeElement: null, createElement: tag => new Element(tag), addEventListener(){}, removeEventListener(){},
    getElementById: id => id === 'rock-container' ? bagField : id === 'helper-container' ? field : id === 'left-panel' ? panel : null,
    querySelectorAll: selector => all().filter(node => selector.split(',').some(part => matches(node, part))),
    querySelector: selector => doc.querySelectorAll(selector)[0] || null};
const bagField=new Element(); body.appendChild(bagField);
const storage = new Map();
const context = {window:{innerWidth:1280, innerHeight:720, addEventListener(){}, removeEventListener(){}, matchMedia:()=>({matches:true})}, document:doc,
    navigator:{maxTouchPoints:0}, getComputedStyle:node=>node.style, performance:{now:()=>100}, console:{log(){},warn(){},error(){}},
    setTimeout(fn, delay){const id=++nextTimer; timers.push({fn,delay,id});return id;}, clearTimeout(id){const timer=timers.find(t=>t.id===id);if(timer)timer.cancelled=true;},
    setInterval(){return ++nextTimer;}, clearInterval(){}, requestAnimationFrame(){return ++nextTimer;}, cancelAnimationFrame(){},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}};
vm.createContext(context);
for (const name of ['balance-data','balance','beta-migration','shop','game','save']) vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),context);
const Game=vm.runInContext('DogeMinerGame',context), Save=vm.runInContext('SaveManager',context), Shop=vm.runInContext('ShopManager',context);
// Rendering is replaced at the boundary; grouping, drag, income and SaveManager stay real.
Game.prototype.createHelperSprite=function(helper){
    const image=new Element('img');image.className='helper-sprite placed-helper';image.dataset.helperId=helper.id;image.src='sprite.webp';field.appendChild(image);
    const tip=new Element();tip.className='helper-name-tooltip';tip.dataset.helperId=helper.id;field.appendChild(tip);
    this.addDragAndDropToHelper(image,helper,tip);
};
for(const name of ['helper-presentation','loot-motion','dogebag-presentation']) vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),context);
const starter={instanceId:'default_normal_pickaxe',templateId:'earth_normal_pickaxe',name:'Normal Pickaxe',baseDPC:1,stats:[],idleSprite:'sprite.webp'};
const game=Object.assign(Object.create(Game.prototype),{currentLevel:'earth',timelineNumber:1,balanceVersion:'dm2-beta-1',
    helpers:[],moonHelpers:[],marsHelpers:[],jupiterHelpers:[],titanHelpers:[],placedHelpers:[],earthPlacedHelpers:[],moonPlacedHelpers:[],marsPlacedHelpers:[],jupiterPlacedHelpers:[],titanPlacedHelpers:[],
    pickaxeInventory:[starter],defaultPickaxe:starter,equippedPickaxeId:starter.instanceId,maxPickaxeDPC:1,fortuneInventory:[],
    helperUpgradeLevels:{},helperUpgradeOffers:{},selectedHelperIds:new Set(),helpersOnCursor:[],placementQueue:[],
    dogecoins:1000,dogediamonds:10,dogediamondsEverObtained:10,totalMined:0,totalClicks:0,highestDps:0,bonusCoinBuffMultiplier:1,
    rockLevel:1,rocksBroken:0,rockCurrentHP:62,rockMaxHP:62,rockBaseHP:60,planetRockData:Object.fromEntries(['earth','moon','mars','jupiter','titan'].map(p=>[p,{rocksBroken:0,rockLevel:1,currentHP:62,maxHP:62}])),
    unlockedLevels:new Set(['earth','moon']),pickaxeFactory:{templates:{}},fortuneFactory:{templates:{}},miningShibeNames:['Saved name'],helperNames:{miningShibe:'Mining Shibe'},
    _helperFieldEpoch:0,isPlaying:true,soundEnabled:false,musicEnabled:false,autoSaveEnabled:false,
    updateUI(){},updateShopPrices(){},updateStatsSidebar(){},showNotification(){},playSound(){},syncBackgroundImages(){},startSearchdogAnimation(){},startMysteryBoxTimer(){},showPendingBetaMigrationReport(){}});
context.window.game=game;const shop=new Shop(game);context.window.shopManager=shop;
const helper=shop.shopData.helpers.miningShibe;
for(let i=0;i<4;i++){game.helpers.push({type:'miningShibe',dps:helper.baseDps});game.placedHelpers.push({type:'miningShibe',helper,dps:helper.baseDps,id:100+i,name:'Name '+i,x:260+i*32,y:150,isMining:false});}
game.recalculatePlayerStats();const initialDps=game.dps, names=game.placedHelpers.map(h=>h.name), ids=game.placedHelpers.map(h=>h.id);
const save=Object.assign(Object.create(Save.prototype),{game,saveKey:'dogeminer_ce_save',backupKey:'backup'});
context.window.saveManager={saveGame(){storage.set('latest',JSON.stringify(save.createSaveData()));return true;}};
game.placedHelpers.forEach(h=>game.createHelperSprite(h));
const visitingRick=new Element('img');visitingRick.id='placed-rick-helper';visitingRick.className='helper-sprite rick-helper';field.appendChild(visitingRick);
game.placedRick={active:true,x:0,y:0,planet:'earth',sprite:visitingRick};
const groupId=game.groupHelpers(game.placedHelpers);
assert.equal(visitingRick.isConnected,true,'Grouping/redrawing normal helpers retains the visiting Rick');
assert.ok(groupId);assert.equal(game.placedHelpers.length,4);assert.equal(doc.querySelectorAll('.placed-helper').length,1);assert.equal(game.dps,initialDps);
assert.deepEqual(game.placedHelpers.map(h=>h.name),names);assert.deepEqual(game.placedHelpers.map(h=>h.id),ids);
const snapshot=save.createSaveData();assert.equal(snapshot.placedHelpers.filter(h=>h.groupId===groupId).length,4);
assert.equal(JSON.parse(storage.get('latest')).earthPlacedHelpers.length,4);
// Real load reconciliation counts all members, rather than spawning three duplicate helpers.
save.applySaveData(JSON.parse(JSON.stringify(snapshot)));
assert.equal(game.placedRick,null,'Replacing a save clears temporary Rick state');
assert.equal(game.placedHelpers.length,4);assert.deepEqual(Array.from(game.placedHelpers,h=>h.name),names);assert.deepEqual(Array.from(game.placedHelpers,h=>h.id),ids);
assert.equal(game.placedHelpers.every(h=>h.groupId===groupId),true);assert.equal(doc.querySelectorAll('.placed-helper').length,1);assert.equal(game.dps,initialDps);
const leader=game.placedHelpers[0], image=doc.querySelector('.placed-helper');
assert.match(image.getAttribute('aria-label'),/×4/);
game.scheduleHelperGroupAction(leader,image);assert.equal(timers.at(-1).delay,2000);timers.at(-1).fn();assert.equal(game._helperGroupAction.textContent,'UNGROUP');
// Moving the visible group moves every saved member and keeps all IDs/names.
image.events.mousedown[0]({button:0,clientX:300,clientY:150,preventDefault(){},stopPropagation(){}});
assert.ok(game._helperDrag);assert.equal(doc.querySelectorAll('.helper-silhouette-shadow').length,1);
game.moveHeldHelpers(350,180);game.releaseHeldHelpers();
assert.ok(game._helperDropMotions.size);for(const item of [...game._helperDropMotions])game.finishHelperMotion(item);
assert.equal(new Set(game.placedHelpers.map(h=>h.x)).size,1);assert.equal(new Set(game.placedHelpers.map(h=>h.y)).size,1);assert.equal(game.dps,initialDps);
assert.deepEqual(Array.from(game.placedHelpers,h=>h.name),names);assert.equal(doc.querySelectorAll('.helper-silhouette-shadow').length,0);
assert.equal(game.ungroupHelpers(groupId,'miningShibe'),true);assert.equal(doc.querySelectorAll('.placed-helper').length,4);assert.equal(game.dps,initialDps);
assert.equal(game.placedHelpers.some(h=>h.groupId),false);assert.deepEqual(Array.from(game.placedHelpers,h=>h.id),ids);
assert.equal(game.groupHelpers([game.placedHelpers[0],{type:'moonShibe'}]),null,'A foreign record cannot join a group');
assert.ok(game.getHelperGroupScale(100000)<2,'Huge groups remain usable on screen');
// A cancelled drag retains its original valid location and never resurrects data after a reset.
const current=game.placedHelpers[0], oldPosition={x:current.x,y:current.y};
const currentImage=doc.querySelector(`.placed-helper[data-helper-id="${current.id}"]`);
currentImage.events.mousedown[0]({button:0,clientX:300,clientY:150,preventDefault(){},stopPropagation(){}});
game.moveHeldHelpers(600,500);game.releaseHeldHelpers(true);assert.equal(current.x,oldPosition.x);assert.equal(current.y,oldPosition.y);
game.clearAllHelperSprites();assert.equal(doc.querySelectorAll('.placed-helper').length,0);assert.equal(game.placedHelpers.length,4);
console.log('PASS: helper groups preserve names, IDs, ownership and DPS through real saves/reloads; group movement, ungrouping, 2-second actions and cancelled drags.');

// Batch opening grants each prize before the next roll, saves before animation,
// and transfers currency withholding to a closing flight exactly once.
const seen=[];const rewards=[
    {type:'fortune',item:{instanceId:'fortuneA',name:'A',rarity:'common',stats:[{name:'wow',value:20,indicator:'+%',isCore:true}]}},
    {type:'fortune',item:{instanceId:'fortuneB',name:'B',rarity:'common',stats:[{name:'luck',value:10,indicator:'+%',isCore:true}]}},
    {type:'coins',amount:7},{type:'diamonds',amount:2}];
game.generateDogebagContents=function(){seen.push({fortunes:this.fortuneInventory.length,wow:this.playerStats.wow});return rewards.shift();};
const flights=[];
game.createFloatingCoin=function(amount){this.pendingCoinDisplayAmount+=amount;flights.push({type:'coins',amount});};
game.createFloatingDiamond=function(amount){this.pendingDiamondDisplayAmount+=amount;flights.push({type:'diamonds',amount});};
const bags=Array.from({length:4},()=>{const bag=new Element();bag.className='dogebag-drop';bag._dogebagRollOptions={planet:'earth',dropType:0};body.appendChild(bag);return bag;});
game.openDogebagModal(bags[0]);game.openDogebagContents();
assert.deepEqual(seen.slice(0,2),[{fortunes:0,wow:0},{fortunes:1,wow:20}]);
assert.equal(game.fortuneInventory.length,2);assert.equal(game.dogecoins,1007);assert.equal(game.dogediamonds,12);
assert.equal(game.pendingCoinDisplayAmount,7);assert.equal(game.pendingDiamondDisplayAmount,2);
assert.deepEqual(flights,[{type:'coins',amount:7},{type:'diamonds',amount:2}]);
const credited=JSON.parse(storage.get('latest'));assert.equal(credited.fortuneInventory.length,2);assert.equal(credited.dogediamonds,12);assert.equal(credited.dogecoins,1007);
game.dogebagLoot();game.dogebagEquip();game.closeDogebagModal();assert.equal(game.fortuneInventory.length,2);assert.equal(game.dogediamonds,12);assert.equal(flights.length,2);
console.log('PASS: Dogebag batch ownership/Wow sequencing, immediate real save, currency-flight withholding transfer and repeated action guards.');
// Importing a credited save clears transient withholding; old view callbacks
// cannot subtract amounts or launch flights into the replacement game.
save.applySaveData(credited);
assert.equal(game.pendingCoinDisplayAmount,0);assert.equal(game.pendingDiamondDisplayAmount,0);
assert.equal(game.dogecoins,1007);assert.equal(game.dogediamonds,12);
const beforeFlights=flights.length;
game._dogebagReveal={opened:true,rewards:[],reviewed:new Set(),bags:[],coins:7,diamonds:2,nodes:[],timers:[],epoch:game._currencyFlightEpoch-1};
game.pendingCoinDisplayAmount=9;game.pendingDiamondDisplayAmount=3;game.closeDogebagModal();
assert.equal(game.pendingCoinDisplayAmount,9);assert.equal(game.pendingDiamondDisplayAmount,3);assert.equal(flights.length,beforeFlights);
// Manual placement remains available and refunds the exact cost on the actual
// planet, including the owned entry rather than deleting an older helper.
game.currentLevel='moon';game.placedHelpers=[];game.moonPlacedHelpers=[];game.autoPlaceHelpers=false;
const moonHelper=shop.shopData.moonHelpers.moonShibe;
const olderMoon={type:'moonShibe',dps:moonHelper.baseDps};const purchasedMoon={type:'moonShibe',dps:moonHelper.baseDps};
game.moonHelpers=[olderMoon,purchasedMoon];game.startHelperPlacement=function(){this.isPlacingHelpers=true;};
const paid=game.getHelperCost(moonHelper.baseCost,1,'moonShibe');const coins=game.dogecoins;
game.dogecoins-=paid;game.addHelperToCursor('moonShibe',moonHelper);game.cancelHelperPlacement();
assert.equal(game.dogecoins,coins);assert.deepEqual(game.moonHelpers,[olderMoon]);assert.equal(game.helpers.length,4);
assert.equal(save.createSaveData().settings.autoPlaceHelpers,false);
console.log('PASS: refreshed batch credits, stale-view currency isolation, and exact manual-placement refunds on another planet.');

// Unopened loot remains in tier piles and survives actual save/load/travel.
game.currentLevel='earth';game.resetDogebagStacks();
for(let i=0;i<3;i++){
 game.createDogebag();const pile=doc.querySelector('.dogebag-stack');
 assert.equal(pile._dogebagGhosts[1].node.hidden,i<1,'Second bag reveals the left layer');
 assert.equal(pile._dogebagGhosts[0].node.hidden,i<2,'Third bag reveals the right layer');
}
let stack=doc.querySelector('.dogebag-drop');
assert.equal(doc.querySelectorAll('.dogebag-drop').length,1);assert.equal(stack._dogebagCount,3);
const quality=stack._dogebagRollOptions.dropType, unopened=save.createSaveData();
assert.equal(unopened.dogebagStacks.earth[quality],3);
save.applySaveData(JSON.parse(JSON.stringify(unopened)));
stack=doc.querySelector('.dogebag-drop');assert.equal(doc.querySelectorAll('.dogebag-drop').length,1);assert.equal(stack._dogebagCount,3);
game.currentLevel='moon';game.syncDogebagField();assert.equal(doc.querySelectorAll('.dogebag-drop').length,0);
game.currentLevel='earth';game.syncDogebagField();assert.equal(doc.querySelectorAll('.dogebag-drop').length,1);
let rolled=0;game.generateDogebagContents=()=>({type:'coins',amount:++rolled});
const beforeClaim=game.dogecoins;
game.openDogebagModal(doc.querySelector('.dogebag-drop'));game.openDogebagContents();
assert.equal(rolled,3);assert.equal(game.dogecoins,beforeClaim+6);assert.equal(doc.querySelectorAll('.dogebag-drop').length,0);
assert.equal(JSON.parse(storage.get('latest')).dogebagStacks.earth[quality],undefined);
assert.equal(timers.some(timer=>timer.delay===15000),false,'Field bags have no legacy fade deadline');
console.log('PASS: Dogebag piles persist through real saves, reloads and planet changes; opening consumes each stored bag once without a despawn timer.');

// Exercise the real staggered opening, rather than forcing its final state.
let clock=0;const scheduled=[],launches=[];
context.performance.now=()=>clock;
context.setTimeout=(fn,delay=0)=>{const timer={id:++nextTimer,fn,due:clock+delay};scheduled.push(timer);return timer.id;};
context.clearTimeout=id=>{const timer=scheduled.find(timer=>timer.id===id);if(timer)timer.cancelled=true;};
context.requestAnimationFrame=fn=>context.setTimeout(()=>fn(clock),10);
context.cancelAnimationFrame=context.clearTimeout;
context.getComputedStyle=()=>({borderRadius:'8px'});
Element.prototype.prepend=function(child){this.appendChild(child);this.children.unshift(this.children.pop());};
Element.prototype.replaceChildren=function(...children){this.children.forEach(child=>child.parentNode=null);this.children=[];this.append(...children);};
Element.prototype.animate=function(frames,options){
    const animation={onfinish:null};
    context.setTimeout(()=>animation.onfinish?.(),options.duration);return animation;
};
const oldRect=Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect=function(){const rect=oldRect.call(this);return this.hidden||this.parentNode?.hidden?{...rect,width:0,height:0}:rect;};
const modalIds=['dogebag-modal','dogebag-state-reveal','dogebag-reward-tray','dogebag-burst-bag','dogebag-burst-count','dogebag-burst-stage','dogebag-burst-title','dogebag-state-prompt','pickaxe-btn','fortune-btn'];
const nodes=Object.fromEntries(modalIds.map(id=>[id,new Element()]));
Object.values(nodes).forEach(node=>body.appendChild(node));
const oldById=doc.getElementById;doc.getElementById=id=>nodes[id]||oldById(id);
const oldShow=game.showDogebagReward;let reviewedAt=null;
game.showDogebagReward=()=>{reviewedAt=clock;};
const oldFly=game.flyDogebagReceipt;
game.flyDogebagReceipt=function(view,index){launches.push({time:clock});return oldFly.call(this,view,index);};
game.currentLevel='earth';game.hasSeenDogebagIntro=true;game.restoreDogebagStacks({earth:{0:4,1:4}});
const batchTypes=['coins','fortune','coins','fortune','diamonds','fortune','fortune','fortune'];let batchIndex=0;
game.generateDogebagContents=()=>{const type=batchTypes[batchIndex++];return type==='fortune'?{type,item:{instanceId:'sequential'+batchIndex,name:'Sequential',rarity:'common',stats:[]}}:{type,amount:5};};
game.openDogebagModal(doc.querySelector('.dogebag-drop'));
const sequentialView=game._dogebagReveal;
assert.equal(batchIndex,8,'Opening one bag consumes every visible quality');
assert.equal(sequentialView.slots.length,7,'Coins share one slot instead of item cards');
assert.ok(sequentialView.slots.every(slot=>slot.button.hidden),'Future rewards leave no empty strip gaps');
function until(time){
    for(;;){const next=scheduled.filter(timer=>!timer.cancelled&&!timer.ran&&timer.due<=time).sort((a,b)=>a.due-b.due||a.id-b.id)[0];if(!next)break;clock=next.due;next.ran=true;next.fn();}
    clock=time;
}
until(569);assert.equal(launches.length,0);
until(570);assert.deepEqual(launches.map(flight=>flight.time),[570]);
assert.equal(sequentialView.receipts[0].classList.contains('arrived'),false,'Receipt only appears on landing');
const firstFlight=doc.querySelector('.dogebag-flight');
sequentialView.slots[0].image.getBoundingClientRect=()=>({left:100,top:0,width:60,height:60});
until(680);assert.deepEqual(launches.map(flight=>flight.time),[570,680]);
until(790);assert.deepEqual(launches.map(flight=>flight.time),[570,680,790]);
until(900);assert.ok(Number(firstFlight.style.transform.match(/translate\(([-.\d]+)px/)[1])>75,'Flying loot follows a receipt that moves as the strip grows');
until(910);assert.equal(sequentialView.receipts[0].classList.contains('arrived'),true);
assert.equal(sequentialView.ready,undefined,'Review waits for every flight');
until(2000);
assert.deepEqual(launches.map(flight=>flight.time),[570,680,790,900,935,1010,1045,1080]);
assert.equal(reviewedAt,1920,'Review follows the final receipt landing');
assert.ok(sequentialView.slots.every(slot=>!slot.button.disabled&&!slot.button.hidden));
game.closeDogebagModal();
// Close before any flight starts: reveal receipts before measuring claim origins.
clock=0;scheduled.length=0;game.restoreDogebagStacks({earth:{0:1}});
game.generateDogebagContents=()=>({type:'fortune',item:{instanceId:'early-close',name:'Early',rarity:'common',stats:[]}});
game.openDogebagModal(doc.querySelector('.dogebag-drop'));
const earlyView=game._dogebagReveal,oldClaim=game.flyDogebagItemToInventory;let claimWidth=0;
game.flyDogebagItemToInventory=function(slot,view){claimWidth=slot.image.getBoundingClientRect().width;return oldClaim.call(this,slot,view);};
assert.equal(earlyView.slots[0].button.hidden,true);
game.closeDogebagModal();assert.equal(claimWidth,60,'Early close flies from a visible receipt');
assert.ok(scheduled.some(timer=>timer.cancelled),'Closing cancels unplayed burst callbacks');
game.showDogebagReward=oldShow;game.flyDogebagItemToInventory=oldClaim;game.flyDogebagReceipt=oldFly;
console.log('PASS: timed sequential mixed-quality opening, accelerating waves, receipt landing gates and early-close claim origins.');

// Mystery Box credits both rolls before its unique opening phases; closing is review only.
for(const id of ['mystery-loot-prompt','mystery-loot-status','mystery-loot-timer','mystery-loot-bonus','mystery-loot-open','mystery-box-btn','mbox-sidebar-timer'])nodes[id]=new Element();
Element.prototype.getAnimations=()=>[];
Element.prototype.focus=function(){doc.activeElement=this;};
vm.runInContext(fs.readFileSync(path.join(root,'mystery-box-presentation.js'),'utf8'),context);
delete game.startMysteryBoxTimer;
context.Date=class extends Date {static now(){return 100000+clock;}};
clock=0;scheduled.length=0;game.mysteryBoxObtained=true;game.mysteryBoxCycle=10;game.mysteryBoxOpenCount=10;
game.mysteryBoxTimerRemaining=0;game._mysteryBoxReadyAt=null;game.isSupporter=false;
game.showDogebagReward=()=>{}; // Card layout is verified in the real browser fixture.
const mysteryBefore=game.fortuneInventory.length,mysteryRolls=[];
game._rollMysteryBoxReward=options=>{mysteryRolls.push({owned:game.fortuneInventory.length,options});return{type:'fortune',item:{instanceId:'mystery'+mysteryRolls.length,name:'Mystery prize',rarity:'rare',stats:[{name:'wow',value:20,indicator:'+%',isCore:true}]}};};
game.openMysteryBoxModal();game.openMysteryBoxRewards();
const mysteryView=game._dogebagReveal;
assert.equal(mysteryView.kind,'mystery');assert.equal(mysteryView.rewards.length,2);
assert.equal(mysteryRolls.length,2);assert.ok(mysteryRolls.every(roll=>roll.owned===mysteryBefore),'Both Mystery Box items are rolled against the pre-opening stats');
assert.equal(game.fortuneInventory.length,mysteryBefore+2);assert.equal(game.mysteryBoxCycle,0);assert.equal(game.mysteryBoxTimerRemaining,1200000);
const mysterySaved=JSON.parse(storage.get('latest'));assert.equal(mysterySaved.fortuneInventory.length,mysteryBefore+2);assert.equal(mysterySaved.mysteryBoxCycle,0);
game.openMysteryBoxRewards();assert.equal(mysteryRolls.length,2,'Repeated OPEN cannot roll or grant again');
assert.equal(mysteryView.ready,undefined);
until(1400);assert.equal(mysteryView.receipts[0].hidden,false);assert.equal(mysteryView.receipts[1].hidden,true);
until(2050);assert.equal(mysteryView.receipts[1].hidden,false);
until(2890);assert.equal(mysteryView.ready,true);
game.closeMysteryBoxModal(true);assert.equal(game.fortuneInventory.length,mysteryBefore+2);assert.equal(game._pendingMysteryBoxRewards,null);
clock+=7000;const offlineSave=save.createSaveData();assert.equal(offlineSave.mysteryBoxTimerRemaining,1200000-clock,'Saving uses elapsed wall time even if interval frames were skipped');
game.openMysteryBoxModal();game.openMysteryBoxRewards();assert.equal(mysteryRolls.length,2,'Cooldown blocks direct calls as well as the button');game.closeMysteryBoxModal();
save.applySaveData(JSON.parse(JSON.stringify(mysterySaved)));assert.equal(game.fortuneInventory.length,mysteryBefore+2,'Reload retains credited Mystery Box items');
console.log('PASS: Mystery Box immediate real saves, source double cycle/cooldown, pre-grant roll context, staggered reveal, duplicate/early-close/cooldown guards and reload preservation.');
