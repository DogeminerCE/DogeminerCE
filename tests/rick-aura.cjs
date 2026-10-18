const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const fixtures = require('./fixtures/dm2-rick-aura.json');
let width = 700, lookups = 0;
const sprites = new Map();
const context = { Math, Number, Map, Set, console, window: {},
    document:{ getElementById:()=>({offsetWidth:width}), querySelectorAll:()=>[...sprites.values()] } };
vm.createContext(context); vm.runInContext(fs.readFileSync('play/js/game.js','utf8'), context);
const Game = vm.runInContext('DogeMinerGame',context);
function game(extra = {}) {
    return Object.assign(Object.create(Game.prototype), { currentLevel:'earth', timelineNumber:1,
        helpers:[],moonHelpers:[],marsHelpers:[],jupiterHelpers:[],titanHelpers:[],placedHelpers:[],
        playerStats:{helperDpsMultiplier:1,totalDpsMultiplier:1},bonusCoinBuffMultiplier:1,
        placedRick:{active:true,planet:'earth',x:70,y:70}, highestDps:0,
        getMysteryDPS:()=>0,refreshBonusCoinLevel(){},getHelperDisplaySize:()=>30,...extra });
}
context.window.shopManager={getCurrentHelperUpgradeInfo(type){lookups++;return {dps:({shibe:10,base:30,bad:NaN})[type]};}};
for(const item of fixtures.cases){
    width=item.width;
    const g=game();
    g.placedHelpers=item.helpers.map((helper,index)=>({...helper,id:index,type:helper.helperID,x:helper.x-15,y:helper.y-15}));
    g.helpers=g.placedHelpers.map(helper=>({type:helper.type,dps:10}));
    g.updateRickAura();
    assert.equal(g.getRickAuraBaseDPS(),item.aura,`Primary IA output: ${JSON.stringify(item)}`);
}
width=700;
assert.equal(game().getRickAuraRadius(),126);
assert.equal(game().getRickAuraRadius(100),70);
assert.equal(game().getRickAuraRadius(10000),240);
assert.equal(game().getRickAuraRadius(0),70);

for(const item of fixtures.income){
    const g=game({helpers:Array.from({length:4},()=>({type:'shibe',dps:10})),
        moonHelpers:Array.from({length:6},()=>({type:'shibe',dps:10})),_rickAuraBaseDps:item.aura,
        playerStats:{helperDpsMultiplier:2.4,flatHelperDps:21,pickaxeFlatDps:7,totalDpsMultiplier:1.15},bonusCoinBuffMultiplier:1.9});
    const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
    close(g.calculateTotalDPS(),item.total);
    close(g.getPlanetMiningDPS('earth'),item.current);
    close(g.getPlanetMiningDPS('moon'),item.other);
    close(g.getOfflineDPS(),(100*2.4+21)*1.15);
}
const grouped=game();
grouped.helpers=Array.from({length:50},()=>({type:'shibe',dps:10}));
grouped.placedHelpers=grouped.helpers.map((helper,index)=>({...helper,id:index,x:85,y:85,groupId:'same'}));
grouped.getHelperGroupMembers=()=>grouped.placedHelpers;
const classes=new Set();
sprites.set('0',{dataset:{helperId:'0'},classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)}});
lookups=0;grouped.updateDPS();
assert.equal(grouped._rickAuraBaseDps,1000,'Every owned group member contributes exactly once');
assert.equal(lookups,2,'Resolve upgraded strength once per type for aura and once for base income');
assert.equal(grouped.dps,1500);
assert.equal(classes.has('rick-boosted'),true);
grouped._helperDrag={items:[{record:grouped.placedHelpers[0]}]};
grouped.updateDPS();
assert.equal(grouped._rickAuraBaseDps,0,'Picking up a group excludes every member immediately');
assert.equal(grouped.dps,500);
assert.equal(classes.has('rick-boosted'),false);
grouped._helperDrag=null;grouped.updateDPS();assert.equal(grouped.dps,1500,'Dropping or canceling returns the bonus');
grouped.placedHelpers=[];grouped.updateDPS();assert.equal(grouped.dps,500,'An empty field never boosts every unplaced helper');
grouped.placedHelpers=[{id:0,type:'shibe',x:85,y:85}];grouped.currentLevel='moon';grouped.updateDPS();
assert.equal(grouped._rickAuraBaseDps,0,'Rick cannot boost another planet');
grouped.currentLevel='earth';grouped.placedRick.sprite={isConnected:false};grouped.updateDPS();
assert.equal(grouped._rickAuraBaseDps,0,'A removed sprite cannot keep generating aura income');

const many=game({helpers:Array.from({length:100},()=>({type:'shibe',dps:10}))});
many.placedHelpers=many.helpers.map((helper,index)=>({...helper,id:index,x:85,y:85}));
sprites.clear();
for(let index=0;index<100;index++)sprites.set(String(index),{dataset:{helperId:String(index)},classList:{add(){},remove(){}}});
many.updateDPS();assert.equal(many.dps,3000);assert.equal(many._rickBoostedSprites.size,40,'Visual cap cannot reduce earned aura income');
console.log(`PASS: ${fixtures.cases.length} DM2 aura / ${fixtures.income.length} income fixtures; range edges, multiplier order, groups, held helpers, planets and 40-stroke cap.`);
