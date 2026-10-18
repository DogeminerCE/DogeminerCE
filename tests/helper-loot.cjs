const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),fixture=require('./fixtures/dm2-helper-loot.json');
const images=[],field={querySelectorAll:()=>images},context={window:{},document:{hidden:false,getElementById:()=>field,querySelectorAll:()=>[]},matchMedia:()=>({matches:true})};
context.window.LootMotion={sample(){throw Error('Reduced motion must skip the dip');}};vm.createContext(context);vm.runInContext('class DogeMinerGame {}',context);vm.runInContext(fs.readFileSync('play/js/helper-loot.js','utf8'),context);
const Game=vm.runInContext('DogeMinerGame',context),api=context.window.DogeMinerHelperLoot;
assert.deepEqual([...api.canLoot],Object.keys(fixture.canLoot));
const g=Object.assign(new Game(),{_bootComplete:true,isPlaying:true,_helperLootClock:0,placedHelpers:[],getHelperGroupMembers:h=>h.group||[h],getHelperDisplaySize:()=>30,getHelperGroupScale:()=>1});
const claims=[];let fail=false;g.collectCoinPile=n=>{if(fail||n.claimed)return false;n.claimed=true;claims.push(n.amount);return true;};
function coin(x,at=fixture.eligibilityMs){return{node:{_helperGrabAt:at,amount:10},x,y:0,id:'coin'};}
function actor(id,x=0){return{id,x,y:0,free:true,sprite:{},members:[{}]};}
const a=actor('a'),near=coin(99),outside=coin(100.01);g.collectNearbyHelperCoins([near],[a]);assert.equal(claims.length,0);g._helperLootClock=1800;g.collectNearbyHelperCoins([outside],[a]);assert.equal(claims.length,0);g.collectNearbyHelperCoins([near],[a]);assert.deepEqual(claims,[10]);
const c1=coin(0),c2=coin(0);g.collectNearbyHelperCoins([c1,c2],[a]);assert.equal(c1.node.claimed,undefined);assert.equal(c2.node.claimed,true,'Newest first, one coin per helper per source poll');g.collectNearbyHelperCoins([c1],[a]);assert.equal(c1.node.claimed,true);
const retry=coin(0);fail=true;g.collectNearbyHelperCoins([retry],[a]);assert.equal(retry.node.claimed,undefined);fail=false;g.collectNearbyHelperCoins([retry],[a]);assert.equal(retry.node.claimed,true);
const held=actor('held');held.free=false;const untouched=coin(0);g.collectNearbyHelperCoins([untouched],[held]);assert.equal(untouched.node.claimed,undefined);
let polled=0;g.getHelperLootCoins=()=>{polled++;return[];};g.isPlaying=false;const old=g._helperLootClock;g.advanceHelperLoot(250);assert.equal(g._helperLootClock,old);g.isPlaying=true;g.isStoryOpen=true;g.advanceHelperLoot(250);assert.equal(g._helperLootClock,old);g.isStoryOpen=false;g.advanceHelperLoot(250);assert.equal(polled,0);g.advanceHelperLoot(250);assert.equal(polled,1);
for(const type of ['miningShibe','moonShibe','partyShibe','superShibe','roboShibe','coinSeeker5000','dogeKennels']){const h={id:type,type,x:20,y:20},sprite={dataset:{helperId:type},offsetWidth:30,offsetHeight:30,isConnected:true,classList:{contains:()=>false}};images.push(sprite);g.placedHelpers.push(h);}
assert.equal(g.getHelperLootActors().length,6);images[0]._helperMotion={};assert.equal(g.getHelperLootActors().length,5,'Held/drop helpers cannot collect');images[0]._helperMotion=null;
const original=g.placedHelpers[0],member={...original,id:'member'};g.placedHelpers.push(member);original.group=member.group=[original,member];assert.equal(g.getHelperLootActors().length,6,'A saved group has one visual actor, retaining all members');assert.equal(g.placedHelpers.length,8);
console.log('PASS: six source canloot types, exact landing eligibility/range, nearest/newest/one-per-poll selection, rejected claim retry, paused gates, held exclusion and unchanged grouped ownership.');

function normalizePlan(plan){return JSON.parse(JSON.stringify({cap:plan.cap,unreachable:[...plan.unreachable],keep:[...plan.keep],retarget:[...plan.retarget],release:[...plan.release],assign:[...plan.assign]}));}
assert.deepEqual(JSON.parse(JSON.stringify(api.config)),fixture.config);
for(const row of fixture.planCases){const helpers=row.helpers.map(h=>({...h,blocked:h.blocked?new Set(h.blocked):null}));assert.deepEqual(normalizePlan(api.planSeekers(row.coins,helpers,api.config)),row.expected);}
for(const row of fixture.waitCases)assert.equal(api.waitPerHop(row.frames,row.speed,api.config),row.expected);
for(const row of fixture.rotated)assert.deepEqual(JSON.parse(JSON.stringify(api.rotatePoint(row.from,row.to,row.degrees))),row.expected);
const straight=api.nextHop({x:0,y:0},{x:200,y:0},{skirts:0,side:0},p=>p);assert.equal(straight.x,14);assert.equal(straight.y,0);
const detour=api.nextHop({x:0,y:0},{x:200,y:0},{skirts:0,side:0},p=>p.x>0&&Math.abs(p.y)<4?null:p);assert.ok(Math.abs(detour.y)>=4);assert.ok(detour.x>0,'Source detour still approaches the target');
assert.equal(api.nextHop({x:0,y:0},{x:200,y:0},{skirts:0,side:0},()=>null),null);assert.equal(api.nextHop({x:0,y:0},{x:90,y:0},{skirts:0,side:0},p=>p),null);
const sample=[];let completed;context.window.LootMotion.sample=(node,duration,value,done)=>{sample.push({duration,from:value(0),mid:value(.5),end:value(1)});completed=done;return{cancel(){this.cancelled=true;}};};
const members=[{id:'group1',name:'First',x:40,y:150},{id:'group2',name:'Second',x:40,y:150}],classes=new Set();const sprite={isConnected:true,style:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}};const group={id:'group1',sprite,members,record:members[0],width:30,height:30};Object.assign(g,{_helperFieldEpoch:3,currentLevel:'earth',startHelperMining(){},stopHelperAnimation(){},getHelperSpritePaths:()=>({idle:'idle'}),updateDPS(){},updateUI(){}});context.window.saveManager={saveGame:()=>true};
g.moveLootHelper(group,{x:(55+15)/.42,y:(150+15)/.42});assert.equal(sample.at(-1).duration,240);assert.equal(members[0].x,40,'Movement is not committed by merely scheduling a hop');completed();assert.ok(Math.abs(members[0].x-55)<1e-9);assert.equal(members[1].x,members[0].x);assert.deepEqual(members.map(h=>[h.id,h.name]),[['group1','First'],['group2','Second']]);
g.moveLootHelper(group,{x:250,y:400});g.cancelLootHelperMove(sprite._helperHop);const x=members[0].x;completed();assert.equal(members[0].x,x,'Cancelled movement cannot commit into a replaced field');
console.log('PASS: 84 executed source target plans, 28 hop waits, source rotations/detours, bounded movement and complete grouped identity retention through finish/cancel.');

images[0].getClientRects=()=>[];assert.equal(g.getHelperLootActors().length,5,'CSS-hidden helpers cannot perform invisible pickup');
images[0].getClientRects=undefined;context.getComputedStyle=node=>({visibility:node===images[0]?'hidden':'visible'});assert.equal(g.getHelperLootActors().length,5,'Visibility-hidden arrival sprites cannot collect either');
