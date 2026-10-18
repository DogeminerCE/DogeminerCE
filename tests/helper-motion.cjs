// Numerical motion fixtures and pickup/drop lifecycle from the audited DM2 model.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let now=0,next=0;const frames=new Map();
class Image {
 constructor(width=60,height=60){this.offsetWidth=width;this.offsetHeight=height;this.isConnected=true;this.style={};this.classes=new Set();this.classList={add:(...n)=>n.forEach(x=>this.classes.add(x)),remove:(...n)=>n.forEach(x=>this.classes.delete(x))};}
 cloneNode(){return new Image(this.offsetWidth,this.offsetHeight);}
 removeAttribute(){}
 remove(){this.isConnected=false;}
}
const field={appendChild(){}};
function Game(){}
const context={DogeMinerGame:Game,window:{matchMedia:()=>({matches:false})},document:{getElementById:()=>field,createElement:()=>({})},
 performance:{now:()=>now},setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/helper-presentation.js','utf8'),context);
const motion=context.window.HelperMotion;
function path(hz){
 const state=motion.newDangle();
 for(let i=0;i<hz/2;i++)motion.stepDangle(state,600/hz,300/hz,1/hz);
 return state;
}
const sixty=path(60),oneTwenty=path(120);
assert.ok(Math.abs(sixty.angle-oneTwenty.angle)<.004,'Frame rates retain the same sway');
assert.ok(Math.abs(sixty.bob-oneTwenty.bob)<.08,'Frame rates retain the same vertical bob');
assert.ok(sixty.angle>0 && sixty.angle<=.16 && Math.abs(sixty.bob)<=2.5);
for(let i=0;i<30;i++)motion.stepDangle(sixty,-10,0,1/60);
assert.ok(sixty.angle<0,'Changing drag direction reverses the pendulum');
for(let i=0;i<180;i++)motion.stepDangle(sixty,0,0,1/60);
assert.ok(Math.abs(sixty.angle)<.001 && Math.abs(sixty.bob)<.001,'Held motion settles without pointer input');
motion.stepDangle(sixty,1e6,1e6,.6);
assert.ok(Number.isFinite(sixty.angle) && Math.abs(sixty.angle)<=.16,'A stalled frame cannot fling the sprite');

const game=Object.assign(Object.create(Game.prototype),{stopHelperAnimation(){},startHelperMining(){this.resumed=(this.resumed||0)+1;},getHelperSpritePaths:()=>({idle:'idle',mining:'mine'})});
context.window.matchMedia=()=>({matches:true}); // Interactive motion must still run.
for(const [width,height] of [[30,30],[60,60],[90,90],[72,72]]){
 const record={type:'test',x:100,y:200},image=new Image(width,height);
 const item=game.makeHeldHelper(record,image);
 assert.equal(item.lift,0,'Pickup starts on the ground, rather than snapping to its peak');
 item.lift=item.maxLift;item.opacity=1;game.paintHelperMotion(item,100,200);
 assert.equal(item.shadow.style.left,'100px');assert.equal(item.shadow.style.top,'200px');
 assert.equal(item.shadow.style.transformOrigin,(width/2)+'px '+height+'px','The silhouette uses the same foot anchor');
 game.dropHeldHelper(item,{x:100,y:200});
 assert.equal(item.lift,item.maxLift,'Release begins at the held height');
 const fall=Math.sqrt(2*item.maxLift/1800)*1000;
 function at(delta){now+=delta;const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());}
 at(fall/2);
 assert.ok(item.lift>0 && item.lift<item.maxLift,'Gravity fall renders intermediate heights');
 at(fall/2+80);
 assert.ok(item.compression>0,'Every helper gets the landing bounce/compression');
 at(100);
 assert.equal(image._helperMotion,null);assert.equal(item.shadow.isConnected,false);assert.equal(image.style.transform,'');
 assert.equal(image.classes.has('helper-motion'),false);
}
assert.equal(game.resumed,4);
console.log('PASS: frame-rate-independent sway/bob, bounded quick movement, soft pickup, aligned footprints, gravity fall and landing bounce across helper sizes.');

vm.runInContext(fs.readFileSync('play/js/dogebag-presentation.js','utf8'),context);
game.layoutDogebagTray=()=>{};
const view={epoch:0},slot={shown:0,total:0,value:{textContent:''}};
game._dogebagReveal=view;game.formatNumber=n=>String(n);
function counterAt(delta){now+=delta;const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn());}
game.countDogebagCurrency(view,slot,500);counterAt(100);
assert.ok(slot.shown>0&&slot.shown<500,'Coin totals visibly count upward');
game.countDogebagCurrency(view,slot,200);counterAt(100);
assert.ok(slot.shown>300&&slot.shown<700,'Later coins retarget the active tally');
counterAt(250);assert.equal(slot.shown,700);assert.equal(slot.value.textContent,'700');
game.countDogebagCurrency(view,slot,10);game._dogebagReveal=null;counterAt(100);
assert.equal(slot.shown,700,'A stale coin ticker cannot update another view');
console.log('PASS: rapid coin count-up, retargeting overlapping arrivals, exact totals and stale-view isolation.');

vm.runInContext(fs.readFileSync('play/js/loot-motion.js','utf8'),context);
const hoverEvents={},hoverRoot={isConnected:true,offsetWidth:100,addEventListener:(type,fn)=>hoverEvents[type]=fn,removeEventListener(){},getBoundingClientRect:()=>({left:0,width:100})},hoverTarget={style:{}};
const hover=context.window.LootMotion.hover(hoverRoot,hoverTarget);
hoverEvents.mouseenter({});counterAt(85);
assert.ok(hover.state.up>1,'Source back easing briefly overshoots the 7px hover lift');
counterAt(85);assert.equal(hover.state.up,1);
hoverEvents.mousemove({clientX:105});counterAt(260);assert.equal(hover.state.lean,.11);
hoverEvents.mousemove({clientX:-5});counterAt(260);assert.equal(hover.state.lean,-.11);
hoverEvents.mouseleave();counterAt(420);
assert.equal(hover.state.up,0);assert.equal(hover.state.lean,0);assert.equal(hover.state.wob,0);
hoverEvents.mouseenter({pointerType:'touch'});assert.equal(frames.size,0,'Phone touches do not start the desktop hover');
hover.detach();
console.log('PASS: DM2 hover lift/grow overshoot, pointer lean limits, direction changes, elastic return and touch isolation.');
const sampled={style:{},isConnected:true,animate(frames,options){this.frames=frames;this.options=options;return this.animation={cancel:()=>this.cancelled=true};}};
context.window.LootMotion.sample(sampled,250,t=>({opacity:.35*t,transform:'scale('+(3*t)+')'}));
sampled.animation.onfinish();assert.equal(sampled.style.opacity,.35);assert.equal(sampled.style.transform,'scale(3)');assert.equal(sampled.cancelled,true);
assert.equal(context.window.LootMotion.shake(0,15),0);assert.equal(context.window.LootMotion.shake(1,15),0);
console.log('PASS: sampled effects retain their final frame without a snap and release animation resources.');
