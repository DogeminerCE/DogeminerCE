// Real cursor state and controller routing: released/held inputs must stay isolated.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');let hit=null;const events=[];const listeners={};let creations=0;
class El {
 constructor(tag='div',classes=''){this.tagName=tag.toUpperCase();this.classes=classes;this.style={setProperty(k,v){this[k]=v;}};this.dataset={};this.children=[];this.clicked=0;this.seen=[];}
 closest(selector){return selector.split(',').some(part=>{part=part.trim();if(part==='button:disabled')return this.tagName==='BUTTON'&&this.disabled;if(part.startsWith('[aria-disabled'))return this.ariaDisabled;if(part.startsWith('.'))return [...part.matchAll(/\.([\w-]+)/g)].every(m=>this.classes.split(' ').includes(m[1]));return part.toUpperCase()===this.tagName;})?this:null;}
 dispatchEvent(event){this.seen.push(event.type);if(event.type==='click')this.clicked++;return true;}
 appendChild(child){this.children.push(child);}
 getClientRects(){return [{}];}
 focus(){doc.activeElement=this;}
 click(){this.clicked++;}
}
const body=new El();const first=new El('button'),second=new El('button');
const modal={querySelectorAll:()=>[first,second]};
const doc={body,activeElement:first,createElement:tag=>{creations++;return new El(tag);},addEventListener(type,fn){(listeners[type]||=[]).push(fn);},elementFromPoint:()=>hit,getElementById:id=>id==='dogebag-modal'?modal:null,
 dispatchEvent:event=>{events.push(event);return true;}};
const context={window:{innerWidth:1280,innerHeight:720},document:doc,navigator:{userAgent:'test'},console,
 MouseEvent:class{constructor(type,props={}){this.type=type;Object.assign(this,props);}},requestAnimationFrame:()=>1,setTimeout:()=>1,clearTimeout(){}};
vm.createContext(context);
for(const file of ['game-cursor','controller'])vm.runInContext(fs.readFileSync(path.join(base,'play/js/'+file+'.js'),'utf8'),context);
const Controller=vm.runInContext('ControllerManager',context),GP=vm.runInContext('GP',context),cursor=context.window.GameCursor;
const game={mouseX:320,mouseY:200,helpersOnCursor:[],isPlacingHelpers:false};context.window.game=game;
const manager=Object.assign(Object.create(Controller.prototype),{game,vcElement:null,vcX:320,vcY:200,showIndicators:false,DEAD_ZONE:.2,vcToggledOn:true,prevButtons:[],prevAxes:[0,0,0,0]});
manager._initVirtualCursor();assert.equal(manager.vcElement.src,cursor.paths.default);
const helper=new El('img','placed-helper');hit=helper;
manager._handleRightStick(1,0);assert.equal(manager.vcElement.src,cursor.paths.grab);assert.equal(manager.vcElement.style.left,`${manager.vcX-16}px`);
assert.deepEqual(helper.seen,['mouseenter']);manager._handleRightStick(0,0);assert.deepEqual(helper.seen,['mouseenter'],'Hover dwell is not restarted on every gamepad frame');
game._helperDrag={};cursor.refresh(game,helper);assert.equal(manager.vcElement.src,cursor.paths.grabbing);assert.equal(body.dataset.cursorState,'grabbing');
manager._simulateVirtualClick(false);assert.equal(events.at(-1).type,'mouseup','RT release always reaches helper/marquee mouseup handlers');
game._helperDrag=null;hit=first;manager._simulateVirtualClick(true);assert.equal(first.clicked,1);
cursor.updateVirtualCursor(manager,game);assert.equal(manager.vcElement.src,cursor.paths.pointer);assert.deepEqual(helper.seen,['mouseenter','mouseleave']);
first.disabled=true;assert.equal(cursor.stateFor(game,first),'disabled');first.disabled=false;
for(const file of Object.values(cursor.paths))assert.ok(fs.existsSync(path.join(base,'play',file)),file);
assert.equal(fs.existsSync(path.join(base,'play/assets/quickUI/Cursor for Controller/pointer.cur')),false);

const buttonState=pressed=>Array.from({length:16},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0}));
game._dogebagReveal={};let closed=0;game.closeDogebagModal=()=>{closed++;};
const frame=pressed=>manager._handleDogebagInput(buttonState(pressed),[0,0,0,0]);
manager.vcToggledOn=false;doc.activeElement=first;const initial=first.clicked;
frame([GP.A]);assert.equal(first.clicked,initial,'A held into the opening frame cannot loot');
frame([]);frame([GP.A]);assert.equal(first.clicked,initial+1);frame([]);frame([GP.RB]);assert.equal(doc.activeElement,second);
frame([]);frame([GP.B]);assert.equal(closed,1);
// Exercise real poll routing; ordinary game controls must never run behind rewards.
manager._disabledByUser=false;manager.gamepadIndex=0;manager.isActive=true;
context.navigator.getGamepads=()=>[{buttons:buttonState([GP.A]),axes:[0,0,0,0]}];
for(const name of ['_handleA','_handleB','_handleX','_handleY','_cyclePanelTab','_cyclePlanetTab'])manager[name]=()=>{throw Error('Game input leaked: '+name);};
manager._pollLoop();
console.log('PASS: shared Kenney cursor assets/hotspots, virtual hover dwell, held-hand state, RT release, and isolated Dogebag controller controls.');

const beforeTracking=creations;
for(let i=0;i<1000;i++)for(const fn of listeners.mousemove||[])fn({target:first,clientX:i,clientY:i});
assert.equal(creations,beforeTracking,'Mouse tracking never creates a DOM cursor or per-frame elements');
console.log('PASS: mouse cursor uses native tracking without a DOM position/render loop.');

const pile = new El('div', 'coin-pile'); pile._lootHover = {};
hit = pile; cursor.updateVirtualCursor(manager, game);
assert.deepEqual(pile.seen, ['mouseenter', 'mousemove']);
cursor.updateVirtualCursor(manager, game);
assert.deepEqual(pile.seen, ['mouseenter', 'mousemove', 'mousemove'], 'Controller movement drives loot lean without restarting hover');
hit = null; cursor.updateVirtualCursor(manager, game);
assert.equal(pile.seen.at(-1), 'mouseleave', 'Leaving a coin pile settles its hover');
console.log('PASS: rock-coin hover and lean share the controller cursor route.');

// A confirmation can be opened from an inventory/reward screen. It owns the
// next gamepad frame before either the underlying modal or reward handler.
manager._dialogOpen=true;manager.prevButtons=[];let dialogFrames=0;
manager._handleDialogInput=justPressed=>{assert.equal(justPressed(GP.A),true);dialogFrames++;};
manager._handleDogebagInput=()=>{throw Error('Reward handled input behind nested confirmation');};
manager._pollLoop();assert.equal(dialogFrames,1);manager._dialogOpen=false;
console.log('PASS: nested confirmation receives gamepad input ahead of background reward/modal routes.');
