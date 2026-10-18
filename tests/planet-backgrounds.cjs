const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8'),start=source.indexOf('  Pr = {'),a=source.indexOf('{',start),b=source.indexOf('\n  },',a)+4;
const locations=vm.runInNewContext('('+source.slice(a,b)+')');
const planets=['earth','moon','mars','jupiter','titan'];
const oracleTimers=[],rendered=[];
const oracle={gP:undefined,fP:undefined,yP:10,kP:-1,wP:[],bP:null,xP:null,dogeminer:{player:{level:1},game:{features:{bgAnimations:true}},datamanager:{getLocationBackgrounds:level=>locations['location'+level].bgs}},setTimeout:(fn,ms)=>{oracleTimers.push({fn,ms});return oracleTimers.length;},clearTimeout(){},dt:()=>null,EP:function(src){rendered.push(src);}};
vm.createContext(oracle);vm.runInContext(source.slice(source.indexOf('var gP,'),source.indexOf('var AP = !1;',source.indexOf('var gP,'))),oracle);
oracle.MP();assert.equal(oracleTimers[0].ms,10000);oracleTimers.shift().fn();assert.equal(rendered[0],locations.location1.bgs[0]);
class Node{constructor(){this.classes=new Set();this.dataset={};this.style={};this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n)),contains:n=>this.classes.has(n)};}getBoundingClientRect(){return{};}}
const nodes=[new Node(),new Node()];nodes[0].classList.add('active');const container={dataset:{},querySelectorAll:()=>nodes},images=[],intervals=new Map(),timeouts=new Map();let seq=0,reduce=false;
class Image{set src(src){this.url=src;images.push(this);}}
const context={window:{matchMedia:()=>({matches:reduce})},document:{hidden:false,getElementById:id=>id==='background-container'?container:null},Image,console:{log(){}},setInterval:(fn,ms)=>{intervals.set(++seq,{fn,ms});return seq;},clearInterval:id=>intervals.delete(id),setTimeout:(fn,ms)=>{timeouts.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timeouts.delete(id)};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/game.js','utf8'),context);const Game=vm.runInContext('DogeMinerGame',context),g=Object.assign(Object.create(Game.prototype),{currentLevel:'earth',currentBackgroundIndex:0,isPlaying:true,_bootComplete:true});
const name=src=>path.basename(src).replace(/\.(jpg|webp)$/,'');
(async()=>{
 let vectors=0;
 for(let i=0;i<planets.length;i++){
  const planet=planets[i],expected=locations['location'+(i+1)].bgs;
  assert.deepEqual(Array.from(g.getPlanetBackgrounds(planet),name),Array.from(expected,name));
  for(const p of g.getPlanetBackgrounds(planet))assert.ok(fs.existsSync('play/'+p),'Local source image exists '+p);
  g.currentLevel=planet;g.currentBackgroundIndex=0;g._backgroundPlanet=planet;g.backgrounds=g.getPlanetBackgrounds(planet);
  oracle.dogeminer.player.level=i+1;oracle.kP=-1;
  for(let j=0;j<expected.length+2;j++){
   oracle._P();if(j)g.currentBackgroundIndex=(g.currentBackgroundIndex+1)%g.backgrounds.length;
   assert.equal(name(g.backgrounds[g.currentBackgroundIndex]),name(rendered.at(-1)));vectors++;
  }
 }
 // Source carries the cursor on travel, wrapping if the new pool is shorter.
 g.currentLevel='mars';g.currentBackgroundIndex=7;g._backgroundPlanet='earth';const pendingMars=g.setPlanetBackgrounds('mars');assert.equal(g.currentBackgroundIndex,0);images.at(-1).onload();await pendingMars;
 const oldSrc=g._backgroundSrc;assert.ok(nodes.some(n=>n.classList.contains('active')));
 g.currentLevel='earth';g._backgroundPlanet='earth';g.backgrounds=g.getPlanetBackgrounds('earth');g.currentBackgroundIndex=3;
 const shared=g.syncBackgroundImages();images.at(-1).onload();await shared;
 const loaded=images.length;g.currentLevel='moon';await g.setPlanetBackgrounds('moon');
 assert.equal(g._backgroundSrc,'assets/backgrounds/bg5.webp');assert.equal(images.length,loaded,'Shared source image needs no reload');assert.equal(container.dataset.planet,'moon','Shared image still updates its scene context');
 g.currentLevel='moon';const pendingMoon=g.setPlanetBackgrounds('moon',{reset:true}),moon=images.at(-1);
 assert.equal(g._backgroundSrc,'assets/backgrounds/bg5.webp','Retain old scene while image loads');
 g.currentLevel='titan';const pendingTitan=g.setPlanetBackgrounds('titan',{reset:true}),titan=images.at(-1);titan.onload();assert.equal(await pendingTitan,true);moon.onload();assert.equal(await pendingMoon,false,'Old planet load cannot replace current');assert.match(g._backgroundSrc,/titan02/);
 assert.equal(nodes.filter(n=>n.classList.contains('active')).length,1);assert.equal(nodes.filter(n=>n.classList.contains('background-previous')).length,1);assert.equal([...timeouts.values()].at(-1).ms,4000,'Source CSS fade lifetime');
 const frame=g._backgroundSrc;const failed=g.rotateBackground();images.at(-1).onerror();assert.equal(await failed,false);assert.equal(g._backgroundSrc,frame,'Failed image keeps displayed frame');
 const retry=g.syncBackgroundImages();images.at(-1).onload();assert.equal(await retry,true,'Failed image can retry');
 reduce=true;const reduced=g.rotateBackground();images.at(-1).onload();await reduced;assert.equal(nodes.filter(n=>n.classList.contains('background-previous')).length,0,'No spatial/long fade with reduced motion');
 g.startBackgroundRotation();g.startBackgroundRotation();assert.equal(intervals.size,1,'One background timer');const tick=[...intervals.values()][0];assert.equal(tick.ms,10000);
 for(const [key,value]of [['isPlaying',false],['isCutscenePlaying',true],['isTransitioning',true]]){g[key]=value;const index=g.currentBackgroundIndex;tick.fn();assert.equal(g.currentBackgroundIndex,index,'Paused/cutscene/transition do not rotate');g[key]=key==='isPlaying';}
 context.document.hidden=true;let index=g.currentBackgroundIndex;tick.fn();assert.equal(g.currentBackgroundIndex,index);context.document.hidden=false;
 tick.fn();await Promise.resolve();assert.equal(g.currentBackgroundIndex,(index+1)%g.backgrounds.length);g.stopBackgroundRotation();assert.equal(intervals.size,0);
 assert.deepEqual(Array.from(g.getPlanetBackgrounds('__proto__')),Array.from(g.getPlanetBackgrounds('earth')));
 console.log('PASS: '+vectors+' executed source pool/wrap vectors, ten-second scheduler, local art, carry/wrap on travel, cached/failed/stale image lifecycles, four-second fade, reduced motion and one guarded timer.');
})().catch(e=>{console.error(e);process.exitCode=1;});
