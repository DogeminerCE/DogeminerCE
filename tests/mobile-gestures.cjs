const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let now=0,mobile=true,modal,selected;const listeners={},windowEvents={};
const doc={activeElement:null,querySelector:()=>modal,addEventListener:(k,fn)=>listeners[k]=fn,removeEventListener:k=>delete listeners[k]};
const context={window:{matchMedia:()=>({matches:true}),addEventListener:(k,fn)=>windowEvents[k]=fn,removeEventListener:k=>delete windowEvents[k]},document:doc,performance:{now:()=>now}};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/mobile-gestures.js','utf8'),context);const api=context.window.DogeMinerMobileGestures;
// Execute both shipped HTML gesture callbacks as the threshold oracle.
const src=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');let horizontal=null,closed=0;const source={document:{getElementById:()=>({})},dogeminer:{helperfunctions:{getDevice:()=> 'phone'}},Sc:(_,axis,fn)=>source[axis]=fn,OL:d=>horizontal=d,RH:()=>closed++};vm.createContext(source);vm.runInContext(src.slice(src.indexOf('var Tc = document'),src.indexOf('var _c =',src.indexOf('var Tc = document'))),source);
for(const ms of [0,100,101,299,300,399,400])for(const delta of [-101,-100,0,100,101]){horizontal=null;closed=0;source.clientX(0,delta,ms);source.clientY(0,delta,ms);const result=api.classify(delta,delta,ms);assert.equal(result.horizontal,horizontal);assert.equal(result.closePanel,closed>0);}
function tile(id){return {id,classList:{contains:k=>k==='equipped'&&id===0},closest:()=>null,focus(){doc.activeElement=this;},scrollIntoView(){this.scrolled=true;}};}
const tiles=[0,1,2].map(tile);modal={classList:{contains:k=>k==='active'},querySelectorAll:()=>tiles,contains:t=>tiles.includes(t)};
const game={isMobileDevice:()=>mobile,equippedPickaxeId:'earned',_showInventoryTooltip(t){selected=t;this._inventoryTooltipCard=t;}};
let closes=0;const ui={mobileMenuOpen:true,closeMobileMenu(){this.mobileMenuOpen=false;closes++;}};
const detach=api.install(game,ui);assert.equal(api.install(game,ui),detach,'Bind once');
function event(target=tiles[0],id=1,x=200,y=100){return {target,pointerId:id,clientX:x,clientY:y,button:0,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};}
function swipe(target,dx,dy,ms=200){listeners.pointerdown(event(target));now+=ms;const up=event(target,1,200+dx,100+dy);listeners.pointerup(up);return up;}
listeners.pointerdown(event());const nativeDrag=event();listeners.dragstart(nativeDrag);assert.equal(nativeDrag.prevented,true);listeners.pointercancel(event());
assert.equal(swipe(tiles[0],-140,0).prevented,true);assert.equal(selected,tiles[1]);assert.equal(game.equippedPickaxeId,'earned','Browsing never equips');const click=event();listeners.click(click);assert.equal(click.stopped,true,'Suppress gesture compatibility click');swipe(tiles[1],-140,0);assert.equal(selected,tiles[2]);swipe(tiles[2],-140,0);assert.equal(selected,tiles[2],'Clamp last item');swipe(tiles[2],140,0);assert.equal(selected,tiles[1]);
const before=selected;swipe(tiles[1],-100,0);swipe(tiles[1],-140,0,300);assert.equal(selected,before);
swipe(tiles[1],-140,0);const unrelated=event({closest:()=>null});listeners.click(unrelated);assert.equal(unrelated.stopped,undefined,'A gesture must not swallow a controller or unrelated control click');
const keyboardClick={...event(tiles[1]),detail:0};listeners.click(keyboardClick);assert.equal(keyboardClick.stopped,undefined,'Keyboard activation is separate from touch compatibility clicks');
const compatibility=event(tiles[1]);listeners.click(compatibility);assert.equal(compatibility.stopped,true);selected=before;game._inventoryTooltipCard=before;
listeners.pointerdown(event());listeners.lostpointercapture(event());listeners.pointerup(event(tiles[0],1,50));assert.equal(selected,before,'Lost pointer capture cancels a pending swipe');
listeners.pointerdown(event());listeners.pointerdown(event(tiles[0],2));now+=200;listeners.pointerup(event(tiles[0],1,50));listeners.pointerup(event(tiles[0],2,50));assert.equal(selected,before,'Multitouch cancels');listeners.pointerdown(event());listeners.pointercancel(event());listeners.pointerup(event(tiles[0],1,50));assert.equal(selected,before);
listeners.pointerdown(event());windowEvents.resize();listeners.pointerup(event(tiles[0],1,50));assert.equal(selected,before);mobile=false;swipe(tiles[1],-140,0);assert.equal(selected,before);mobile=true;game.isStoryOpen=true;swipe(tiles[1],-140,0);assert.equal(selected,before);game.isStoryOpen=false;
modal=null;const header={closest:s=>s.includes('#mobile-panel-tabs')?header:null},content={closest:()=>null},rock={closest:s=>s.includes('#rock-container')?rock:null},input={closest:s=>s.includes('input')?input:null};
swipe(header,0,140);assert.equal(closes,1);for(const target of [content,rock,input]){ui.mobileMenuOpen=true;swipe(target,0,140);assert.equal(ui.mobileMenuOpen,true);}ui.mobileMenuOpen=true;swipe(header,0,140,100);assert.equal(ui.mobileMenuOpen,true);swipe(header,0,140,400);assert.equal(ui.mobileMenuOpen,true);
detach();assert.equal(Object.keys(listeners).length,0);assert.equal(Object.keys(windowEvents).length,0);
console.log('PASS:35 executed source threshold vectors, grid browse/clamp without equip, ghost-click prevention, panel header close, native content scroll/mining/control guards, desktop/modal/multitouch/cancel/resize and cleanup.');
