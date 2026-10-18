const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync('play/js/time-travel.js','utf8'),ctx);const Travel=vm.runInContext('TimeTravelManager',ctx),source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');
async function oracle(late){
 let now=0,id=0,done=null;const timers=new Map(),frames=[];const delay=(fn,ms)=>{const key=++id;timers.set(key,{fn,at:now+ms});return key;};
 class Sprite{constructor(textures){this.textures=textures;this.anchor={};this.position={set(){}};this.scale={};}play(){const frameMs=1000/(60*this.animationSpeed);for(let n=0;n<this.textures.length;n++)delay(()=>frames.push({at:now,frame:this.textures[n]}),frameMs*n);delay(()=>this.onComplete?.(),frameMs*this.textures.length);}}
 const add={addChild(){}},o={Promise,HB:{stage:add,carSprite:add},v:Sprite,setTimeout:delay,dogeminer:{game:{assets:{missions:Object.fromEntries(Array.from({length:5},(_,i)=>['missions/lightning/ln'+(i+1),i+1]))}},sound:{playMission(){}}}};vm.createContext(o);vm.runInContext(source.match(/function VB\([^]*?\n\}/)[0],o);o.VB(0,0,late).then(()=>{done=now;});
 while(timers.size){const [key,t]=[...timers].sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];timers.delete(key);now=t.at;t.fn();await Promise.resolve();}
 await Promise.resolve();return {frames,done};
}
(async()=>{for(const late of [false,true]){const actual=await oracle(late),ce=Travel.lightningFrames(late);assert.equal(actual.frames.length,11);assert.equal(ce.frames.length,11);for(let n=0;n<11;n++){assert.equal(actual.frames[n].frame,ce.frames[n].frame);assert.ok(Math.abs(actual.frames[n].at-ce.frames[n].at)<1e-8);}assert.ok(Math.abs(actual.done-ce.end)<1e-8);assert.ok(Math.abs(ce.end-Travel.MISSION_TIMING.teleport)<1e-8);}
 // Compare event deadlines against the original action functions, not DOM motion.
 const yb=source.match(/function YB\([^]*?\n\}/)[0];assert.match(yb,/\}, 2760\)/);assert.match(yb,/\}, 2200\)/);assert.match(yb,/\}, 2700\)/);assert.match(yb,/fadeOut\(a, 200/);assert.match(yb,/\}, 3e3\)/);assert.match(yb,/fadeIn\(t, 500/);assert.equal(Travel.MISSION_TIMING.exitStart,2760);assert.equal(Travel.MISSION_TIMING.cower,3200);assert.equal(Travel.MISSION_TIMING.whiteFade,500);assert.equal(Travel.MISSION_TIMING.rewardHold,3000);
 const gb=source.match(/function GB\([^]*?\n\}/)[0];assert.match(gb,/fadeIn\(xB, 1e3/);assert.match(gb,/\}, 12e3\)/);assert.equal(Travel.MISSION_TIMING.catelandEntry,13000);
 console.log('PASS: both executed DM2 lightning animations match all 22 frame timestamps and completion; source Cateland/drive/cower/whiteout/reward deadlines retained.');
})().catch(e=>{console.error(e);process.exit(1)});
