const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const ctx={window:{},document:{hidden:false,hasFocus:()=>true,querySelector:()=>null,getElementById:()=>null},Math,Date,console,setTimeout,clearTimeout};vm.createContext(ctx);for(const file of ['game','rick-visitor'])vm.runInContext(fs.readFileSync('play/js/'+file+'.js','utf8'),ctx);const Game=vm.runInContext('DogeMinerGame',ctx),api=ctx.window.DogeMinerRickVisitor;const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');const actions=[...source.matchAll(/eD\("(rmref\d?)", (\d+), \(\) => KP.timeplayed > (\d+)([^)]*)\)/g)].map(m=>({id:m[1],delay:+m[2],seconds:+m[3],earth:m[4].includes('maxlevel')}));assert.equal(actions.length,3);for(const row of actions)for(const seconds of [row.seconds-1,row.seconds,row.seconds+1])for(const max of [1,2]){const seen=actions.filter(a=>a.id!==row.id).map(a=>a.id);const actual=api.reference(seconds,max,seen);assert.equal(actual?.[0],seconds>row.seconds&&(!row.earth||max===1)?row.id:undefined);if(actual)assert.equal(actual[2],row.delay);}assert.equal(api.randomDelay(()=>0),480000);assert.equal(api.randomDelay(()=>1),900000);
let saves=0,spawn=[];const g=Object.assign(Object.create(Game.prototype),{isPlaying:true,currentLevel:'earth',timelineNumber:1,unlockedLevels:new Set(['earth']),timelineProgress:{current:{playTimeMs:901000},completed:[]},encounters:{version:1,caught:0,missed:0,stolen:0,rickReferences:[]},spawnRick(options){spawn.push(options);},_rickSchedule:{elapsed:0,target:480000}});ctx.window.saveManager={commitEncounterProgress(){saves++;return true;}};for(let i=0;i<5;i++)g.advanceRickVisitor(1000);assert.equal(spawn.length,1);assert.deepEqual(JSON.parse(JSON.stringify(g.encounters.rickReferences)),['rmref']);assert.equal(spawn[0].autoJump,false);g._rickReference=null;g._rickSchedule.elapsed=480001;g.advanceRickVisitor(1000);assert.equal(spawn.length,2);assert.equal(typeof spawn[1].autoJump,'boolean');ctx.document.hidden=true;const before=g._rickSchedule.elapsed;g.advanceRickVisitor(1000);assert.equal(g._rickSchedule.elapsed,before);
console.log('PASS: executed source reference IDs/times/delays and strict boundaries;8–15 minute range, one durable first portal, repeat clock and hidden-tab pause.');

ctx.window.DogeMinerTools={reduced:()=>false};ctx.document.hidden=false;const style=()=>({style:{}});let exits=0;g.updateDPS=()=>{};g.despawnRick=()=>{exits++;g.placedRick=null;};g.placedRick={planet:'earth',remainingMs:10,ageMs:0,held:true,nextWander:Infinity,nextPhrase:Infinity,timerBadge:{style:{},textContent:'',classList:{toggle(){}}},tooltip:style(),zoneEl:style(),sprite:style(),pick:style(),x:100,y:200};for(let i=0;i<9;i++)g.advanceRickVisitor(1000);assert.equal(exits,0,'source held-expiry grace');g.placedRick.held=false;g.advanceRickVisitor(1000);assert.equal(exits,1,'release after expiry exits');

g._rickPortalFlow={elapsed:100};g.isDraggingRick=true;g.rickVisible=true;g._rickReference={id:'rmref'};g.resetRickVisitor();assert.equal(g._rickPortalFlow,null);assert.equal(g._rickReference,null);assert.equal(g.isDraggingRick,false);assert.equal(g.rickVisible,false);

// Exercise the real portal -> field handoff, including the still-fading head.
const nodes=new Set(),timeouts=[];
function target(object={}){const listeners=new Map();return Object.assign(object,{addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);},fire(type,event={}){for(const fn of [...listeners.get(type)||[]])fn({button:0,preventDefault(){},stopPropagation(){},...event});}});}
class Element{constructor(){target(this);this.style={};this.children=[];this.naturalWidth=180;this.naturalHeight=247;this.complete=true;const classes=new Set();this.classList={add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(){}};}
    appendChild(child){child.parentNode=child.parentElement=this;this.children.push(child);nodes.add(child);return child;}
    append(child){this.appendChild(child);}
    remove(){for(const c of [...this.children])c.remove();nodes.delete(this);if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=this.parentElement=null;}
    getBoundingClientRect(){return {x:0,y:0,left:0,top:0,width:700,height:600};}}
const panel=Object.assign(new Element(),{id:'left-panel',offsetWidth:700,offsetHeight:600}),field=Object.assign(new Element(),{id:'helper-container'});nodes.add(panel);nodes.add(field);
const all=selector=>[...nodes].filter(n=>selector.split(',').some(s=>s[0]==='#'?n.id===s.slice(1):(n.className||'').split(' ').includes(s.slice(1))));
Object.assign(ctx.document,target({}),{createElement:()=>new Element(),getElementById:id=>all('#'+id)[0],querySelectorAll:all,querySelector:()=>null,hidden:false});
Object.assign(ctx.window,target({}));ctx.setTimeout=(fn)=>{timeouts.push(fn);return timeouts.length;};ctx.clearTimeout=()=>{};ctx.setInterval=()=>1;ctx.clearInterval=()=>{};
const visitor=Object.assign(Object.create(Game.prototype),{isPlaying:true,currentLevel:'earth',timelineNumber:1,rickSprites:['r1','r2','r3','r4'],pickaxeFactory:{templates:{pick:{name:'Pick',idleSprite:'standard.webp'}}},updateDPS(){},updateUI(){},playSound(){},findNearestValidSpot:(x,y)=>({x,y})});
visitor.spawnRick({autoJump:true});visitor.advanceRickVisitor(2000);visitor.advanceRickVisitor(500);
const first=visitor.placedRick,emerging=ctx.document.getElementById('rick-doge');
assert.equal(emerging.style.pointerEvents,'none','Fading portal head must stop accepting grabs immediately');
emerging.fire('mousedown',{clientX:600,clientY:300});assert.equal(visitor.isDraggingRick,false);
assert.equal(visitor.dropRick(100,100),false,'A second drop cannot replace the live visitor');
assert.equal(visitor.placedRick,first);assert.equal(all('#placed-rick-helper').length,1);assert.equal(all('.rick-field-pickaxe').length,1);
assert.equal(first.pick.parentElement,first.sprite.parentElement,'Head and tool share movement and facing');
first.sprite.fire('mousedown',{clientX:100,clientY:100});assert.equal(first.held,true,'Mouse/touch drag owns the expiry hold');ctx.window.fire('blur');assert.equal(first.held,false);
visitor.despawnRick({animate:false});assert.equal(all('#placed-rick-helper').length,0);assert.equal(all('.rick-field-pickaxe').length,0);
visitor.resetRickVisitor();assert.equal(all('.rick-field-rig').length,0);
visitor.spawnRick({autoJump:false});visitor.startRickDragFromPortal(100,100);assert.equal(visitor._rickPortalFlow,null);assert.equal(all('#rick-cursor-sprite').length,1);
visitor.dropRick(100,200);assert.equal(all('#rick-cursor-sprite').length,0);assert.equal(all('#placed-rick-helper').length,1);visitor.resetRickVisitor();
console.log('PASS: fading-portal grab race, duplicate-drop rejection, one shared rig, mouse hold/blur, manual handoff and complete sprite/tool cleanup.');

// A placed visitor expires by wall time while focus and animation clocks stop.
let wall=100000;ctx.Date={now:()=>wall};ctx.document.hasFocus=()=>false;ctx.document.hidden=true;
const timed=Object.assign(Object.create(Game.prototype),{currentLevel:'earth',timelineNumber:1,isPlaying:true,dps:115,_rickSchedule:{elapsed:0,target:480000},calculateTotalDPS:()=>100,despawnRick(){this.placedRick=null;this.dps=100;}});
const timedRick=()=>({active:true,planet:'earth',timeline:1,expiresAt:wall+30000,remainingMs:30000,held:false,timerBadge:{style:{},textContent:'',classList:{toggle(){}}}});
timed.placedRick=timedRick();wall+=10000;timed.advanceRickVisitor(16);assert.equal(timed.placedRick.remainingMs,20000);assert.match(timed.placedRick.timerBadge.textContent,/20s/);wall+=20000;timed.advanceRickVisitor(16);assert.equal(timed.placedRick,null);assert.equal(timed.dps,100);
assert.equal(timed.getRickPassiveIncome(5000),575,'Income interval ending at the deadline keeps its earned prefix');assert.equal(timed.getRickPassiveIncome(5000),500,'Expired receipt is consumed once');
timed.dps=115;timed.placedRick=timedRick();wall+=40000;assert.equal(timed.getRickPassiveIncome(40000),4450,'Suspended tab earns only thirty seconds of Rick in a forty-second interval');assert.equal(timed.placedRick,null);assert.equal(timed.getRickPassiveIncome(5000),500);
timed.dps=115;timed.placedRick=timedRick();timed.placedRick.held=true;wall+=39000;assert.equal(timed.isRickVisitExpired(),false);wall+=1000;timed.advanceRickVisitor(0);assert.equal(timed.placedRick,null,'Held grace remains bounded at ten seconds, even without focus');
console.log('PASS: unfocused/hidden wall-clock expiry, zero-frame suspension, exact crossing-interval income, one-shot receipt and bounded held grace.');
