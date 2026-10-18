const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={console:{log(){},warn(){},error(){}},location:{hash:''},CEParityTesting:{active:true},document:{querySelectorAll:()=>[],querySelector:()=>null,getElementById:()=>null},clearTimeout(){},clearInterval(){},fetch:async url=>{const path='play/'+decodeURIComponent(url);return fs.existsSync(path)?{ok:true,text:async()=>fs.readFileSync(path,'utf8')}:{ok:false,status:404};}};root.window=root;
vm.createContext(root);for(const file of ['balance-data','balance','dm2-import-data','seasonal','pickaxe-factory','fortune-factory','game'])vm.runInContext(fs.readFileSync('play/js/'+file+'.js','utf8'),root);
const rules=root.DogeMinerSeasonal,balance=root.DogeMinerBalance,Game=vm.runInContext('DogeMinerGame',root),source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');
const oracle={window:{location:{hash:''}},Date,Math,dogeminer:{game:{holiday:0},player:{level:1,easter:{eh:0,fg:0}}},spirit:0};oracle.NK=()=>oracle.spirit/2;vm.createContext(oracle);
for(const name of ['gt','ZK','eJ'])vm.runInContext(source.match(new RegExp('function '+name+'\\(\\) \\{[\\s\\S]*?\\n\\}'))[0],oracle);
let dates=0;for(const year of [2024,2026,2027])for(let month=0;month<12;month++)for(let day=1;day<=31;day++){
 const date=new Date(year,month,day,12);oracle.Date=class extends Date{constructor(){super(date);}};
 assert.equal(rules.calendar(date),oracle.gt());dates++;
}
assert.equal(rules.calendar(new Date(2026,11,25),'#noholiday'),0);
for(const bad of [{eh:10},{eh:1,found:[1,1]},{eh:1,found:['bad']},{eh:1,fg:1},{eh:0,found:[1]},{eh:2,fg:3}])assert.throws(()=>rules.hunt(bad));
assert.equal(rules.normalize(null,{sourceSettings:{holidays:false},easter:{eh:2,fg:0,found:[1,2]}}).enabled,false);
const g=Object.assign(Object.create(Game.prototype),{currentLevel:'moon',timelineNumber:3,_seasonalPreview:'easter',seasonal:rules.normalize(null),helpers:[{type:'miningShibe',dps:100}],playerStats:{holidaySpirit:400,helperDpsMultiplier:1.25,totalDpsMultiplier:1.14,flatHelperDps:50,mysteryBonus:121111},getRickAuraBaseDPS:()=>20,getStoryDPS:()=>10});
let incomes=0;
for(const event of [0,'easter','halloween','xmas'])for(const planet of ['earth','moon'])for(const count of [0,1,8,9])for(const golden of count===9?[false,true]:[false])for(const spirit of [0,1,2,400,999999]){
 g._seasonalPreview=event;g.currentLevel=planet;g.seasonal.easter={count,golden,found:[]};g.playerStats.holidaySpirit=spirit;
 oracle.dogeminer.game.holiday=event;oracle.dogeminer.player={level:planet==='earth'?1:2,easter:{eh:count,fg:golden?1:0}};oracle.spirit=spirit;
 // Outside previews, use a fixed ordinary date for the event=0 branch.
 const actual=event?rules.income(g):{multiplier:1,flat:0};assert.equal(actual.multiplier,oracle.eJ());assert.equal(actual.flat,oracle.ZK());
 if(event){const base=(120*1.25+50+10+(planet==='earth'?0:1260));assert.ok(Math.abs(g.calculateTotalDPS()-(base*oracle.eJ()+oracle.ZK())*1.14)<1e-8);}
 incomes++;
}
g.seasonal.enabled=false;assert.equal(rules.active(g),0);assert.equal(rules.income(g).flat,0);assert.equal(rules.income(g).multiplier,1);g.seasonal.enabled=true;
g._seasonalPreview='none';assert.equal(rules.active(g,new Date(2026,11,25)),0,'Private ordinary preview overrides even Christmas');
root.CEParityTesting.active=false;root.localStorage={getItem(){throw new Error('Normal game must not read preview storage');}};
assert.equal(rules.active(g,new Date(2026,11,25)),'xmas','Normal play keeps the real calendar');
assert.equal(rules.active(g,new Date(2026,9,1)),0);root.CEParityTesting.active=true;delete root.localStorage;
(async()=>{
 g.pickaxeInventory=[];g.fortuneInventory=[];g.pickaxeFactory=vm.runInContext('new PickaxeFactory()',root);g.fortuneFactory=vm.runInContext('new FortuneFactory()',root);root.game=g;await g.pickaxeFactory.loadTemplates();await g.fortuneFactory.loadTemplates();
 let items=0;
 for(const [event,pool]of Object.entries(rules.pools)){
  g._seasonalPreview=event;
  for(const planet of ['earth','moon','mars','jupiter','titan'])for(let grade=0;grade<=3;grade++){
   const candidates=balance.getNaturalLootPool(g,{planet,dropType:grade}).candidates;
   for(const kind of ['pickaxe','fortune'])for(const id of pool[kind])assert.ok(candidates.some(c=>c.kind===kind&&c.dm2Id===id),event+'/'+planet+'/'+grade+'/'+id);
   for(const kind of ['pickaxe','fortune'])for(const id of pool[kind])assert.ok(balance.getMysteryLootPool(g,{planet,dropType:grade,kind}).candidates.some(c=>c.dm2Id===id));
  }
  for(const kind of ['pickaxe','fortune'])for(const id of pool[kind]){
   const template=Object.values(g[kind+'Factory'].templates).find(t=>t.balanceDefinitionId===id);assert.ok(template);const item=kind==='pickaxe'?g.pickaxeFactory.generatePickaxe(template.id,100,0,null,()=>.5):g.fortuneFactory.generateFromTemplate(template.id,null,()=>.5);assert.equal(item.balanceDefinitionId,id);if(kind==='fortune')assert.equal(item.isProtected,true);items++;
  }
 }
 g.seasonal.enabled=false;assert.equal(balance.getNaturalLootPool(g,{planet:'earth',dropType:0}).candidates.filter(c=>c.template.season).length,0);
 // Real runtime methods retain both progress and collectible on a failed commit.
 const definitions=new Map();root.DogeMinerStories={registerNarrative:d=>definitions.set(d.id,d)};let fail=false,committed=null,clears=0;
 Game.prototype._commitStoryProgress=function(next){if(fail)return false;committed=structuredClone(this.seasonal);this.storyProgress=next;return true;};
 vm.runInContext(fs.readFileSync('play/js/seasonal-runtime.js','utf8'),root);
 Object.assign(g,{seasonal:{version:1,enabled:true,easter:{found:[2,3,4,5,'setting','inv1','inv2','upgrade'],count:8,golden:false}},_seasonalPreview:'easter',_seasonalEpoch:7,_seasonalEgg:{id:1,epoch:7},renderSeasonal(){},updateDPS(){},showNotification(){},playSound(){},clearHiddenEgg(){assert.equal(committed.easter.count,9,'Grant commits before removing collectible');clears++;this._seasonalEgg=null;}});
 root.saveManager={commitStoryProgress(){if(fail)return false;committed=structuredClone(g.seasonal);return true;}};
 fail=true;assert.equal(g.collectHiddenEgg(1),false);assert.equal(g.seasonal.easter.count,8);assert.equal(clears,0);fail=false;assert.equal(g.collectHiddenEgg(1),true);assert.equal(g.seasonal.easter.count,9);assert.equal(g.collectHiddenEgg(1),false);
 g.storyProgress={seen:[]};fail=true;assert.equal(g._commitStoryProgress({seen:['eggz21']}),false);assert.equal(g.seasonal.easter.golden,false);fail=false;assert.equal(g._commitStoryProgress({seen:['eggz21']}),true);assert.equal(committed.easter.golden,true);assert.equal(definitions.get('eggz21').eligible(g),false);
 console.log('PASS: '+dates+' source-calendar dates, '+incomes+' source income combinations, 31 seasonal items in every planet/grade/Mystery pool, protection, opt-out, invalid hunt rejection, collect/save failure recovery and atomic golden completion.');
})().catch(error=>{console.error(error);process.exit(1)});
