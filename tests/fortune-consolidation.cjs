const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const fixtures=require('./fixtures/dm2-fortune-consolidation.json');
let failingKey=null;
const storage=new Map(),context={window:{},console:{log(){},warn(){},error(){}},Math,Date,Set,Map,
 document:{hidden:false,body:{dataset:{},classList:{remove(){}}},querySelectorAll:()=>[],getElementById:()=>null},
 setTimeout(){},clearTimeout(){},setInterval:()=>1,clearInterval(){},
 localStorage:{getItem:key=>storage.get(key)??null,setItem(key,value){if(key===failingKey){failingKey=null;throw new Error('Quota rejected');}storage.set(key,String(value));},removeItem:key=>storage.delete(key)}};
vm.createContext(context);
for(const name of ['balance-data','balance','game','timeline-history','save','time-travel','beta-migration'])vm.runInContext(fs.readFileSync(`play/js/${name}.js`,'utf8'),context);
const Travel=vm.runInContext('TimeTravelManager',context),Game=vm.runInContext('DogeMinerGame',context),Save=vm.runInContext('SaveManager',context);
const json=value=>JSON.parse(JSON.stringify(value));
for(const fixture of fixtures.cases){
 const items=fixture.input.map(([id,stats],index)=>({templateId:id,balanceDefinitionId:id,name:id,instanceId:`owned-${index}`,isProtected:true,
  stats:stats.map(([name,value])=>({name,balanceKey:name,indicator:'+',value}))}));
 const original=JSON.stringify(items),merged=Travel.consolidateFortunes(items);
 assert.deepEqual(json(merged.map(item=>[item.templateId,item.stats.map(stat=>[stat.balanceKey,stat.value])])),fixture.output);
 assert.equal(JSON.stringify(items),original,'Planning a merge never mutates owned items');
 assert.equal(Travel.consolidateFortunes(merged).length,merged.length,'Consolidation is idempotent');
 for(const item of merged)assert.equal(item.consolidatedCopies||1,items.filter(old=>old.templateId===item.templateId).length);
}
const fractional=[{templateId:'custom',isProtected:true,stats:[{name:'luck',value:.6}]},{templateId:'custom',isProtected:true,stats:[{name:'luck',value:.6}]}];
assert.equal(Travel.consolidateFortunes(fractional)[0].stats[0].value,1.2,'Earned fractions are retained, overriding source truncation');
const mixed=Travel.consolidateFortunes([{templateId:'custom',stats:[{name:'luck',indicator:'+',value:7}]},
 {templateId:'custom',stats:[{name:'luck',indicator:'+%',value:9}]}]);
assert.equal(mixed[0].stats.length,2,'Custom unit/sign variants are not collapsed into one misleading stat row');
assert.equal(Travel.consolidateFortunes([{name:'Same',stats:[]},{name:'Same',stats:[]}]).length,2,'Unidentified items cannot merge just because their names match');
assert.equal(Travel.consolidateFortunes([{templateId:'one',name:'Same'},{templateId:'two',name:'Same'}]).length,2);
const stack=Travel.consolidateFortunes([{templateId:'custom',consolidatedCopies:3,stats:[{name:'luck',value:90}]},
 {templateId:'custom',stats:[{name:'luck',value:20}]}])[0];
assert.equal(stack.consolidatedCopies,4);assert.equal(stack.stats[0].value,110,'Existing stacked totals are not multiplied again');
assert.throws(()=>Travel.consolidateFortunes([{templateId:'huge',stats:[{name:'luck',value:Number.MAX_VALUE}]},
 {templateId:'huge',stats:[{name:'luck',value:Number.MAX_VALUE}]}]),/supported range/);
const patron={templateId:'badge_of_patronage',instanceId:'patron-a',name:'Badge of Patronage',isSoulbound:true,
 stats:[{name:'luck',balanceKey:'luck',indicator:'+%',value:15},{name:'patronage',balanceKey:'patronage',value:100}]};
const patron2={...json(patron),instanceId:'patron-b'};
function game(){
 const g=Object.assign(Object.create(Game.prototype),{currentLevel:'earth',timelineNumber:1,dogecoins:1e6,totalMined:2e6,totalClicks:9,
  dogediamonds:500,dogediamondsEverObtained:500,totalPlayTime:123,startTime:10000,highestDps:0,notificationsEnabled:false,
  helpers:[{type:'miningShibe',dps:.2}],moonHelpers:[],marsHelpers:[],jupiterHelpers:[],titanHelpers:[],placedHelpers:[],
  fortuneInventory:[json(patron),patron2,{templateId:'super_fortune',name:'Super Fortune',isSuperFortune:true,isProtected:true,
   stats:[{name:'dps',balanceKey:'persec',value:123456},{name:'luck',balanceKey:'luck',value:999}]}],
  pickaxeInventory:[{instanceId:'pick',name:'Normal Pickaxe',baseDPC:1,stats:[]}],equippedPickaxeId:'pick',
  planetRockData:{earth:{maxHP:10,currentHP:10}},rockMaxHP:10,rockCurrentHP:10,rockBaseHP:10,rocksBroken:0,
  _currencyFlightEpoch:7,formatNumber:String,getPlanetRockBaseHP:()=>10,getRockHP:()=>10,
  updateUI(){},updateDiamondCounter(){},clearAllHelperSprites(){},showNotification(){}});
 g.restoreTimelineProgress({timelineNumber:1,totalMined:g.totalMined,timelineProgress:{version:1,trackingStartedTimeline:1,completed:[],
  current:{timeline:1,earnedCoins:2e6,minedAtSync:2e6,playTimeMs:65000,estimated:false}}});
 const t=new Travel(g);t.updateDogetalkieButton=()=>{};t._showYouKnowTheDrill=()=>{};
 t._chosenBadge='luck';t._missionChoice='attack';t.computePayout();t._buildRewards();
 const save=Object.assign(Object.create(Save.prototype),{game:g,saveKey:'save',backupKey:'backup'});
 context.window.saveManager=save;
 return {g,t,save};
}
const {g,t,save}=game();g.diamondStacks={earth:3,moon:7};g.currentLevel='mars';context.document.body.dataset.planet='mars';save.saveGame(false);
const oldSave=storage.get('save'),oldBackup=storage.get('backup'),inventory=JSON.stringify(g.fortuneInventory),quote=t._payoutContext;
const badgeBefore=JSON.stringify(t._newBadge);
failingKey='save';assert.equal(t._executeTimelineReset(),false);
assert.equal(storage.get('save'),oldSave);assert.equal(storage.get('backup'),oldBackup,'A failed primary write rolls back the newly written backup');
assert.equal(g.diamondStacks.earth,3,'Failed prestige preserves unclaimed diamonds');assert.equal(g.timelineNumber,1);assert.equal(context.document.body.dataset.planet,'mars');assert.equal(g.dogediamonds,500);assert.equal(g.dogecoins,1e6);
assert.equal(g.timelineProgress.completed.length,0);assert.equal(JSON.stringify(g.fortuneInventory),inventory);
assert.equal(JSON.stringify(t._newBadge),badgeBefore,'A failed commit cannot absorb old badge values into the new quote');
assert.equal(t._payoutContext,quote);
failingKey='backup';assert.equal(t._executeTimelineReset(),false);
assert.equal(storage.get('save'),oldSave);assert.equal(storage.get('backup'),oldBackup);
assert.equal(t._executeTimelineReset(),true,'The same review can safely retry after storage recovers');
assert.equal(Object.keys(g.diamondStacks).length,0,'Source prestige clears unclaimed field loot');assert.equal(g.timelineNumber,2);assert.equal(g.dogediamonds,502);assert.equal(g.timelineProgress.completed.length,1);
const combined=g.fortuneInventory.find(item=>item.templateId==='badge_of_patronage');
assert.equal(combined.instanceId,'patron-a');assert.equal(combined.consolidatedCopies,2);
assert.equal(combined.stats.find(stat=>stat.name==='luck').value,30);
assert.equal(combined.stats.find(stat=>stat.name==='patronage').value,200);
assert.equal(g.fortuneInventory.find(item=>item.isSuperFortune).stats.find(stat=>stat.balanceKey==='persec').value,123456);
assert.equal(g.totalMined,2e6);assert.equal(g.totalPlayTime,123);
const durable=JSON.parse(storage.get('save'));assert.equal(durable.timelineNumber,2);assert.equal(durable.timelineProgress.completed.length,1);
assert.equal(durable.fortuneInventory.find(item=>item.templateId==='badge_of_patronage').consolidatedCopies,2);
const done=storage.get('save');assert.equal(t._executeTimelineReset(),false);assert.equal(storage.get('save'),done);
const migrated=context.window.BetaSaveMigration.prepare({...durable,balanceVersion:null},{game:g});
assert.equal(migrated.saveData.fortuneInventory.find(item=>item.templateId==='badge_of_patronage').stats.find(stat=>stat.name==='luck').value,30,
 'Protected copy totals remain earned during a later migration');
console.log(`PASS: ${fixtures.cases.length} source HQ fixtures; fixed/seasonal/custom identity, fractions, repeated stacks, earned Alpha bonuses and atomic save/backup failure-retry.`);
