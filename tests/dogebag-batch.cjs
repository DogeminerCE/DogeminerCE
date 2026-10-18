const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let saved,saves=0;
const summary={hidden:true,textContent:''};
const context={window:{saveManager:{saveGame(){saves++;saved=JSON.parse(JSON.stringify({coins:g.dogecoins,diamonds:g.dogediamonds,picks:g.pickaxeInventory,fortunes:g.fortuneInventory,stacks:g.dogebagStacks}));return true;}}},document:{getElementById:id=>id==='dogebag-batch-summary'?summary:{}},clearInterval(){}};
vm.createContext(context);for(const name of ['game','dogebag-presentation'])vm.runInContext(fs.readFileSync('play/js/'+name+'.js','utf8'),context);
const Game=vm.runInContext('DogeMinerGame',context);
let g;
for(const counts of [[99],[99,99,99,99],[150]]){
    const total=counts.reduce((a,b)=>a+b,0),beforeCoins=100,beforeDiamonds=5;let rolls=0,presented;
    const bags=counts.map((count,dropType)=>({_dogebagCount:count,_dogebagRollOptions:{planet:'earth',dropType},remove(){this.removed=true;}}));
    g=Object.assign(Object.create(Game.prototype),{dogecoins:beforeCoins,totalMined:200,dogediamonds:beforeDiamonds,dogediamondsEverObtained:beforeDiamonds,pickaxeInventory:[],fortuneInventory:[],dogebagStacks:{earth:Object.fromEntries(counts.map((n,i)=>[i,n]))},
        maxPickaxeDPC:1,markInventoryUnread(){},setLatestObtainedFortune(){},recalculatePlayerStats(){},updateUI(){},
        generateDogebagContents(){const i=rolls++;return i%4===0?{type:'pickaxe',item:{instanceId:'pick-'+i,baseDPC:2}}:i%4===1?{type:'fortune',item:{instanceId:'fortune-'+i,name:'Fortune'}}:i%4===2?{type:'coins',amount:7}:{type:'diamonds',amount:2};},
        presentDogebagRewards(view){presented=view;},_dogebagReveal:{bags,options:{planet:'earth'},rewards:[],coins:0,diamonds:0}});
    const previousSaves=saves;g.openDogebagContents();
    assert.equal(rolls,total);assert.equal(presented.rewards.length,total);assert.equal(saves,previousSaves+1);
    const picks=presented.rewards.filter(r=>r.type==='pickaxe').length,fortunes=presented.rewards.filter(r=>r.type==='fortune').length,coins=presented.rewards.filter(r=>r.type==='coins').length,diamonds=presented.rewards.filter(r=>r.type==='diamonds').length;
    assert.equal(g.pickaxeInventory.length,picks);assert.equal(g.fortuneInventory.length,fortunes);assert.equal(g.dogecoins-beforeCoins,coins*7);assert.equal(g.dogediamonds-beforeDiamonds,diamonds*2);
    assert.equal(picks+fortunes+coins+diamonds,total);assert.equal(saved.picks.length,picks);assert.equal(saved.fortunes.length,fortunes);assert.equal(saved.coins,g.dogecoins);assert.equal(saved.diamonds,g.dogediamonds);
    assert.ok(bags.every(b=>b.removed&&b._dogebagCount===0));assert.ok(Object.values(saved.stacks.earth).every(n=>n===0));
    g.openDogebagContents();assert.equal(rolls,total,'Repeated OPEN cannot grant twice');assert.equal(saves,previousSaves+1);
    // Run the real summary, stopping before the animation-only tray work.
    g.rebuildDogebagTray=()=>{throw new Error('summary complete');};
    assert.throws(()=>Game.prototype.presentDogebagRewards.call(g,presented),/summary complete/);
    assert.equal(summary.hidden,false);assert.ok(summary.textContent.startsWith(total+' bags opened'));
}
console.log('PASS: 99, four capped stacks (396), and earned overflow (150) grant and save every reward once, with exact inventory/currency totals and visible full-batch counts.');
