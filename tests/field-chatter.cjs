const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),f=require('./fixtures/dm2-field-personality.json');let next=0;const timers=new Map();function Game(){};const context={DogeMinerGame:Game,window:{matchMedia:()=>({matches:false}),DogeMinerBalance:{getDefinition:(_k,item)=>({id:item?.id||'default'})}},document:{hidden:false,querySelectorAll:()=>[]},Math,setTimeout:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},clearTimeout:id=>timers.delete(id)};vm.createContext(context);for(const n of ['field-personality-data','field-personality'])vm.runInContext(fs.readFileSync('play/js/'+n+'.js','utf8'),context);const api=context.window.DogeMinerFieldPersonality,g=new Game();g.isPlaying=true;g.getEquippedPickaxe=()=>({id:g.tool});
for(const c of f.phraseCases){g.tool=c.tool;assert.equal(api.phrase(g,c.kind,()=>c.random),c.result,JSON.stringify(c));}for(const c of f.idle){context.document.querySelectorAll=()=>Array.from({length:c.count},()=>({_helperHoverRecord:{type:'miningShibe'}}));g.showFieldPhrase=()=>true;assert.equal(g.rollIdleHelperChatter(()=>c.random),c.talks,JSON.stringify(c));}for(const c of f.families)assert.equal(api.family(c.type),c.phrase==='target1'?'target':c.phrase,c.type);assert.equal(api.family('spaceRocket'),null,'Dormant rocket branch remains gated');
for (const text of [...f.phrases.interaction,...f.phrases.after].filter(s=>s.includes('<icon>'))) assert.equal(api.plainPhrase(text).trim(),'','Source empty icon phrases stay silent');
// Execute the shipped trigger and placement functions, instead of inferring
// cadence from a short observation or copying a second implementation.
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');
assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync('tests/reference/play-B7Micxas.js')).digest('hex'),f.sha256);
let sourcePhrases=0,sourceAngle=0;const placed=[];
const oracle={xm:false,fm:false,rm:{rocksounds:false,clicks:0,equipped:{pick:0},pickaxes:[['default']]},KX:()=>({}),am:()=>0,
    om:{showText(){sourcePhrases++;},getPickaxeClickStrength:()=>0},dogeminer:{game:{},enableLayers:false,player:{},datamanager:{getRandomPhrase:()=> 'wow'}},
    Math:Object.create(Math),is:()=>.5,Ks(){},Js(){},yr:class{constructor(text,style){this.text=text;this.style=style;this.anchor={};this.position={set:(x,y)=>{this.x=x;this.y=y;}};}}};
oracle.Math.random=()=>sourceAngle;vm.createContext(oracle);
vm.runInContext(source.slice(source.indexOf('function Bm('),source.indexOf('function Rm(')),oracle);
vm.runInContext(source.slice(source.indexOf('function Ys('),source.indexOf('var Ks =')),oracle);
g.showFieldPhrase=()=>true;
for(const roll of [0,.049,.05,.199999,.2,.200001,.999999]){oracle.am=()=>roll;const before=sourcePhrases;oracle.Bm(null);assert.equal(g.rollMiningChatter(()=>roll),sourcePhrases>before,'Source accepted-hit boundary '+roll);}
let positions=0;for(const [width,height]of [[628,588],[373,731],[318,487],[407,336],[800,700]])for(let i=0;i<16;i++){
    sourceAngle=i/16;oracle.Ys(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,{addChild:n=>placed.push(n)},width,height);
    const expected=placed.at(-1),actual=api.miningPosition(width,height,()=>sourceAngle);
    assert.ok(Math.abs(actual.x-expected.x)<1e-10&&Math.abs(actual.y-expected.y)<1e-10,'Source circular placement '+JSON.stringify({width,height,sourceAngle}));
    assert.equal(expected.anchor.x,1);assert.equal(expected.anchor.y,1);positions++;
}
let shown=[];g.showFieldPhrase=(text,options)=>{shown.push({text,options});return true;};g.tool='default';assert.equal(g.rollMiningChatter(()=>f.timing.miningChance),false);assert.equal(g.rollMiningChatter(()=>f.timing.miningChance-.000001),true);assert.equal(shown.length,1);for(const flag of ['isIntroPlaying','isCutscenePlaying','isTransitioning','isBetaReportOpen','isOfflineReportOpen','isStoryOpen','_dogebagReveal']){g[flag]=true;assert.equal(g.rollMiningChatter(()=>0),false,flag);g[flag]=false;}context.document.hidden=true;assert.equal(g.rollIdleHelperChatter(()=>0),false);context.document.hidden=false;
let miningCount=0;g.showFieldPhrase=()=>{miningCount++;return true;};for(let i=0;i<100;i++)g.rollMiningChatter(()=>i/100);assert.equal(miningCount,20,'Source ordinary hits use a twenty percent independent roll');g._fieldPhrases=new Set(Array.from({length:45},()=>({_isMiningPhrase:true})));assert.equal(g.rollMiningChatter(()=>0),true,'Mining text is not limited by two lines or the helper text budget');g._fieldPhrases.clear();g.showFieldPhrase=(text,options)=>{shown.push({text,options});return true;};
const drag={items:[{record:{type:'miningShibe'},element:{isConnected:true}}]};g._helperDrag=drag;g._helperFieldEpoch=1;g.beginHeldHelperChatter(drag,()=>0);assert.equal(drag._willTalk,true);assert.equal([...timers.values()][0].ms,200);[...timers.values()][0].fn();assert.equal(shown.at(-1).text,f.phrases.interaction[0]);const before=shown.length;g.endHeldHelperChatter(drag,false,()=>0);assert.equal(shown.length,before,'A held phrase suppresses after-drop chatter');g.beginHeldHelperChatter(drag,()=>.9);assert.equal(drag._willTalk,false);g.endHeldHelperChatter(drag,false,()=>0);assert.equal(shown.at(-1).text,f.phrases.after[0]);const after=shown.length;g.endHeldHelperChatter(drag,true,()=>0);assert.equal(shown.length,after,'Cancellation never speaks');
g.beginHeldHelperChatter(drag,()=>0);g._helperFieldEpoch++;[...timers.values()].at(-1).fn();assert.equal(shown.length,after,'Old field cannot speak');g._helperFieldEpoch--;drag.items[0].record.type='streamerKittens';g.beginHeldHelperChatter(drag,()=>0);[...timers.values()].at(-1).fn();assert.equal(shown.length,after,'Held chatter is only for source named helpers');g._fieldPhrases=new Set(Array.from({length:40},()=>({})));assert.equal(g.canShowFieldChatter(),false);
// Rendering ownership: a second line must not cut off the first line's fade.
timers.clear();g._fieldPhrases=new Set();g.showFieldPhrase=Game.prototype.showFieldPhrase;g.getHelperDisplaySize=()=>30;
const field={offsetWidth:600,appendChild(n){n.isConnected=true;}};
context.document.getElementById=()=>field;
context.document.createElement=()=>({offsetWidth:80,isConnected:false,style:{setProperty(k,v){this[k]=v;}},setAttribute(){},remove(){this.isConnected=false;}});
const anchor={isConnected:true,style:{left:'120',top:'180'},_helperHoverRecord:{type:'miningShibe'}};
const first=g.showFieldPhrase('first phrase',{sprite:anchor,random:()=>.5}),second=g.showFieldPhrase('second phrase',{sprite:anchor,random:()=>.5});
assert.ok(first.isConnected&&second.isConnected,'New chatter cannot abruptly remove a previous phrase');assert.equal(anchor._fieldPhraseBubbles.size,2);g.positionHelperChatter(anchor,240,100);assert.equal(first.style.left,'240px');assert.equal(second.style.left,'240px');
const lifetime=f.timing.fadeInMs+1800+f.timing.fadeOutMs;assert.equal(timers.get(first._expiry).ms,lifetime);timers.get(first._expiry).fn();assert.equal(first.isConnected,false);assert.equal(anchor._fieldPhrase,second);assert.equal(anchor._fieldPhraseBubbles.size,1);
context.window.matchMedia=()=>({matches:true});const reducedPhrase=g.showFieldPhrase('reduced motion phrase',{sprite:anchor,random:()=>.5});assert.equal(timers.get(reducedPhrase._expiry).ms,lifetime,'Reduced motion retains the complete fade lifecycle');assert.equal(reducedPhrase.style['--phrase-angle'],'0deg');g.clearFieldChatter();assert.equal(g._fieldPhrases.size,0);assert.equal(anchor._fieldPhraseBubbles.size,0);assert.equal(anchor._fieldPhrase,null);assert.equal(timers.size,0);
field.offsetHeight=600;
for(let i=0;i<45;i++)assert.equal(g.rollMiningChatter(()=>0),true);
assert.equal(g._fieldPhrases.size,45,'Neither two-line nor helper budget limits mining words');
assert.ok([...g._fieldPhrases].every(n=>n.className==='field-phrase field-phrase-mining'));
g.clearFieldChatter();assert.equal(timers.size,0);
console.log(`PASS: executed DM2 hit-roll boundaries and ${positions} circular placements;120 phrase vectors,64 population cases,30 helper gates, uncapped mining, held/drop, fades and cleanup.`);
