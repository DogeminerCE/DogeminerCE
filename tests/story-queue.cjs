const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const fixtures=require('./fixtures/dm2-story-queue.json');
let now=1000000,hidden=false,focused=true,blocked=false,failKey=null;
const storage=new Map();class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
const context={window:{location:{hash:''}},document:{get hidden(){return hidden;},hasFocus:()=>focused,querySelector:()=>blocked?{}:null,querySelectorAll:()=>[],getElementById:()=>null,body:{dataset:{},style:{},classList:{remove(){}}}},Date:Clock,Math,Set,Map,console:{log(){},warn(){},error(){}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},localStorage:{getItem:key=>storage.get(key)??null,setItem(key,value){if(key===failKey){failKey=null;throw new Error('Storage rejected');}storage.set(key,String(value));},removeItem:key=>storage.delete(key)}};
vm.createContext(context);for(const file of ['game','save','stories'])vm.runInContext(fs.readFileSync(`play/js/${file}.js`,'utf8'),context);
const Game=vm.runInContext('DogeMinerGame',context),Save=vm.runInContext('SaveManager',context),api=context.window.DogeMinerStories;
const plain=value=>JSON.parse(JSON.stringify(value));
for(const id of ['one','two','newtimeline','bonus','welcomeback']){ if (!api.get(id)) api.register({id,title:id,effect(g,next){next.extraDps+=7;}}); }
assert.deepEqual(plain(api.alwaysShow),fixtures.alwaysShow);
function create(extra={}){
 const g=Object.assign(Object.create(Game.prototype),{currentLevel:'earth',timelineNumber:1,isPlaying:true,_bootComplete:true,storiesEnabled:true,totalMined:1000,dogecoins:500,totalClicks:1,fortuneInventory:[],pickaxeInventory:[],helpers:[],moonHelpers:[],marsHelpers:[],jupiterHelpers:[],titanHelpers:[],placedHelpers:[],endSwing(){},updateDPS(){this.dps=10+this.getStoryDPS();},updateUI(){},...extra});
 const opened=[];g._showStoryPopup=(definition)=>{opened.push(definition.id);return{closed:false,close(){this.closed=true;}};};
 g.restoreStoryProgress({timelineNumber:g.timelineNumber});
 const save=Object.assign(Object.create(Save.prototype),{game:g,saveKey:'save',backupKey:'backup'});context.window.saveManager=save;
 return{g,save,opened};
}
for(const {input,output} of fixtures.cases){
 context.window.location.hash=input.noPops?'#nopops':'';const {g,opened}=create({storiesEnabled:input.enabled,isPlacingHelpers:input.holding,isTransitioning:input.paused});g.storyProgress.seen=['seen'];
 assert.equal(g.queueStory(input.id),true);assert.equal(g.queueStory(input.id),false);assert.equal(g.queueStory('seen'),false);
 assert.deepEqual(plain(g.storyProgress.pending),output.queuedBefore);g.deliverNextStory();if(opened.length)assert.equal(g.completeStory(g._activeStory),true);
 assert.deepEqual(opened,output.opened);assert.deepEqual(plain(g.storyProgress.seen.filter(id=>id!=='seen')),output.seen);
 assert.equal(g.getStoryDPS(),output.effects.filter(id=>!['bonus','newtimeline'].includes(id)).length*7);assert.deepEqual(plain(g.storyProgress.pending),output.pending);
}
context.window.location.hash='';
const {g,save}=create();assert.equal(g.queueStory('one'),true);g.deliverNextStory();const token=g._activeStory,old=JSON.stringify(g.storyProgress),oldSave=storage.get('save'),oldBackup=storage.get('backup');
failKey='save';assert.equal(g.completeStory(token),false);assert.equal(JSON.stringify(g.storyProgress),old);assert.equal(storage.get('save'),oldSave);assert.equal(storage.get('backup'),oldBackup);assert.equal(g.isStoryOpen,true);
failKey='backup';assert.equal(g.completeStory(token),false);assert.equal(JSON.stringify(g.storyProgress),old);assert.equal(storage.get('save'),oldSave);
assert.equal(g.completeStory(token),true);assert.equal(g.getStoryDPS(),7);assert.equal(g.completeStory(token),false);assert.equal(g.getStoryDPS(),7);assert.equal(JSON.parse(storage.get('save')).storyProgress.extraDps,7);assert.equal(JSON.parse(storage.get('save')).dps,17);
const durable=JSON.parse(storage.get('save'));g.restoreStoryProgress(durable);assert.equal(g.queueStory('one'),false);assert.equal(g.getStoryDPS(),7);assert.equal(g.completeStory(token),false,'A detached old view cannot complete after import');
const chain=create().g;chain.queueStory('one');chain.deliverNextStory();chain.completeStory(chain._activeStory);assert.equal(chain.queueStory('two'),true);chain.deliverNextStory();assert.equal(chain._activeStory,null,'Source close delay prevents another popup in the same frame');now+=501;assert.equal(chain.deliverNextStory(),true);const pending=chain.getStoryProgressForSave();chain.restoreStoryProgress({timelineNumber:1,storyProgress:pending});assert.equal(chain.isStoryOpen,false);assert.equal(chain.deliverNextStory(),true,'Pending unacknowledged story survives reload');
for(const flag of ['isIntroPlaying','isCutscenePlaying','isTransitioning','isBetaReportOpen','isOfflineReportOpen','isPlacingHelpers','_dogebagReveal','_helperDrag']){const item=create().g;item[flag]=true;assert.equal(item.canPresentStory(),false,flag);}
for(const name of ['betaMigrationReport','offlineEarningsReport']){const item=create().g;item[name]={acknowledged:false};assert.equal(item.canPresentStory(),false,'Pending receipt takes priority before its presentation timer');}
hidden=true;assert.equal(create().g.canPresentStory(),false);hidden=false;focused=false;assert.equal(create().g.canPresentStory(),false);focused=true;blocked=true;assert.equal(create().g.canPresentStory(),false);blocked=false;
const next=create({timelineNumber:2}).g;assert.equal(next.queueStory('bonus'),false,'Source first-timeline-only suppression');assert.equal(next.queueStory('unknown'),false);
next.storyProgress={version:1,timeline:2,seen:['hitsong','hitsng','music','yaypat','titan1','upgfast2k','eastr21'],pending:['two'],extraDps:1100};
assert.deepEqual(plain(next.nextTimelineStoryProgress(3)),{version:1,timeline:3,seen:['music','yaypat','titan1','upgfast2k'],pending:['newtimeline3'],extraDps:0,completionHistoryVersion:1});
next.holiday='easter';assert.equal(next.nextTimelineStoryProgress(3).seen.includes('eastr21'),true);
assert.throws(()=>api.normalize({version:2},1),/not supported/);assert.throws(()=>api.normalize({version:1,timeline:2},1),/not supported/);assert.throws(()=>api.normalize({version:1,timeline:1,seen:[{}]},1),/invalid IDs/);assert.throws(()=>api.normalize({version:1,timeline:1,extraDps:Infinity},1),/income is invalid/);
const overflow=create().g;overflow._activeStory={id:'one',epoch:overflow._storyEpoch,timeline:1};overflow.storyProgress.pending=['one'];overflow.storyProgress.extraDps=Number.MAX_VALUE;api.register({id:'huge',title:'Huge',effect(game,draft){draft.extraDps*=2;}});overflow.storyProgress.pending=['huge'];overflow._activeStory.id='huge';assert.equal(overflow.completeStory(overflow._activeStory),false);assert.equal(overflow.getStoryDPS(),Number.MAX_VALUE);
console.log(`PASS: ${fixtures.cases.length} executed source queue/close/suppression cases; seen/pending persistence, primary/backup rollback/retry, stale view, popup gates, source prestige reset and invalid-state guards.`);
