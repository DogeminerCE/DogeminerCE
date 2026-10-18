const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const fixtures=require('./fixtures/dm2-timeline-history.json');
const storage=new Map(),context={window:{},console:{log(){},warn(){},error(){}},Math,Date,Map,Set,
 document:{hidden:false,body:{dataset:{},classList:{remove(){}}},querySelectorAll:()=>[],getElementById:()=>null},
 localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))},
 setInterval:()=>1,clearInterval(){},clearTimeout(){},setTimeout(){}};
vm.createContext(context);
for(const name of ['game','timeline-history','save','time-travel'])vm.runInContext(fs.readFileSync(`play/js/${name}.js`,'utf8'),context);
const Game=vm.runInContext('DogeMinerGame',context),Save=vm.runInContext('SaveManager',context),Travel=vm.runInContext('TimeTravelManager',context);
const history=context.window.DogeMinerTimelineHistory;
function game(extra={}){
 return Object.assign(Object.create(Game.prototype),{currentLevel:'earth',timelineNumber:1,_bootComplete:true,isPlaying:true,
  dogecoins:1000,totalMined:2000,totalClicks:99,totalPlayTime:12,startTime:1000,dogediamonds:10,dogediamondsEverObtained:10,
  helpers:[],moonHelpers:[],marsHelpers:[],jupiterHelpers:[],titanHelpers:[],placedHelpers:[],fortuneInventory:[],pickaxeInventory:[],
  planetRockData:{earth:{currentHP:10,maxHP:10}},rockCurrentHP:10,rockMaxHP:10,rockBaseHP:10,
  _currencyFlightEpoch:0,formatNumber:n=>String(n),getPlanetRockBaseHP:()=>10,getRockHP:()=>10,
  recalculatePlayerStats(){},updateDPS(){},updateUI(){},updateDiamondCounter(){},clearAllHelperSprites(){},...extra});
}
const first=game();first.restoreTimelineProgress({timelineNumber:1,totalMined:2000,dogecoins:1000,timestamp:20000,
 statistics:{startTime:10000,totalPlayTime:12}});
assert.equal(first.getCurrentTimelineStats().earnedCoins,2000);
assert.equal(first.getCurrentTimelineStats().playTimeMs,22000);
assert.equal(first.getCurrentTimelineStats().estimated,false);
const prior=game({timelineNumber:5});prior.restoreTimelineProgress({timelineNumber:5,totalMined:2000,dogecoins:1000});
assert.equal(prior.getCurrentTimelineStats().earnedCoins,1000,'A veteran Alpha save cannot invent earlier spent earnings');
assert.equal(prior.getCurrentTimelineStats().estimated,true);
assert.equal(prior.timelineProgress.completed.length,0);
assert.equal(prior.timelineProgress.trackingStartedTimeline,5);
const g=game();g.restoreTimelineProgress({timelineNumber:1,totalMined:2000,dogecoins:1000});
g.totalMined+=500;g.dogecoins-=250;
assert.equal(g.getCurrentTimelineStats().earnedCoins,2500,'Spending cannot reduce current-run earned coins');
assert.equal(g.getCurrentTimelineStats().earnedCoins,2500,'Reading stats cannot count income again');
g.advanceTimelineProgress(750);g.advanceTimelineProgress(250);
assert.equal(g.getCurrentTimelineStats().playTimeMs,1000);
for(const flag of ['isIntroPlaying','isCutscenePlaying','isTransitioning','isBetaReportOpen','isOfflineReportOpen']){
 g[flag]=true;g.advanceTimelineProgress(1000);g[flag]=false;
}
g.isPlaying=false;g.advanceTimelineProgress(1000);g.isPlaying=true;
context.document.hidden=true;g.advanceTimelineProgress(1000);context.document.hidden=false;
assert.equal(g.getCurrentTimelineStats().playTimeMs,1000,'Pauses/reports/background time do not advance mining time');
const serialized=g.getTimelineProgressForSave(),copy=game({totalMined:g.totalMined,dogecoins:g.dogecoins});
copy.restoreTimelineProgress({timelineNumber:1,totalMined:g.totalMined,timelineProgress:JSON.parse(JSON.stringify(serialized))});
assert.equal(copy.getCurrentTimelineStats().earnedCoins,2500);
copy.totalMined+=216;copy.dogecoins+=216;
assert.equal(copy.getCurrentTimelineStats().earnedCoins,2716,'Offline income counts as earned currency, never active play time');
assert.equal(copy.getCurrentTimelineStats().playTimeMs,1000);
copy.advanceTimelineProgress(60000);assert.equal(copy.getCurrentTimelineStats().playTimeMs,2000,'Suspended frames cannot simulate offline play');

for(const fixture of fixtures.cases){
 const {input,output}=fixture;
 const item=game({timelineNumber:input.timeline,dogecoins:input.coins,totalMined:input.earned,records:{highestcrit:1337}});
 item.restoreTimelineProgress({timelineNumber:input.timeline,totalMined:input.earned,timelineProgress:{version:1,trackingStartedTimeline:input.timeline,completed:[],
  current:{timeline:input.timeline,earnedCoins:input.earned,minedAtSync:input.earned,playTimeMs:input.playTimeMs,estimated:false}}});
 const manager=new Travel(item);manager.updateDogetalkieButton=()=>{};manager._showYouKnowTheDrill=()=>{};
 manager._chosenBadge='luck';manager._missionChoice=history.choiceOf(input.choice);manager.computePayout();manager._buildRewards();
 const save=Object.assign(Object.create(Save.prototype),{game:item,saveKey:'save',backupKey:'backup'});
 context.window.saveManager=save;
 const lifetime={mined:item.totalMined,clicks:item.totalClicks,time:item.totalPlayTime,start:item.startTime};
 assert.equal(manager._executeTimelineReset(),true);
 const record=item.timelineProgress.completed[0];
 assert.equal(record.coins,output.timelinecoins[0]);assert.equal(record.earnedCoins,output.timelinealltimecoins[0]);
 assert.equal(Math.floor(record.playTimeMs/1000),output.timelineplayeds[0]);
 assert.equal(record.choice,history.choiceOf(output.kitlerstats[0]));
 assert.equal(item.timelineNumber,output.timeline);assert.equal(item.getCurrentTimelineStats().earnedCoins,output.alltimecoins);
 assert.equal(item.getCurrentTimelineStats().playTimeMs,output.timeplayedms);
 assert.deepEqual({mined:item.totalMined,clicks:item.totalClicks,time:item.totalPlayTime,start:item.startTime},lifetime,'CE lifetime counters survive prestige');
 assert.equal(item.records.highestcrit,1337,'Lifetime critical record survives prestige');
 const saved=JSON.parse(storage.get('save'));assert.equal(saved.records.highestcrit,1337);assert.equal(saved.timelineProgress.completed.length,1);
 assert.equal(saved.timelineProgress.current.timeline,item.timelineNumber);
 manager._executeTimelineReset();assert.equal(item.timelineProgress.completed.length,1,'Repeated completion cannot append another history record');
 const loaded=game({timelineNumber:item.timelineNumber,totalMined:item.totalMined});loaded.restoreTimelineProgress(saved);
 assert.equal(loaded.timelineProgress.completed.length,1);assert.equal(loaded.getCurrentTimelineStats().earnedCoins,0);
}
assert.throws(()=>history.normalize({version:2}),/not supported/);
assert.throws(()=>history.normalize({version:1,completed:{}}),/invalid/);
const duplicate=history.normalize({version:1,completed:[{timeline:1,choice:0},{timeline:1,choice:1},{timeline:-3},{timeline:2.5},{timeline:5}]},{timelineNumber:3});
assert.equal(duplicate.completed.length,1);assert.equal(duplicate.completed[0].choice,'attack');
console.log(`PASS: ${fixtures.cases.length} DM2 timeline archive/reset outputs; lifetime preservation, current-run income/time, refresh/offline/pauses, legacy estimates and duplicate guards.`);
