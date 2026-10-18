const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const fixture=require('./fixtures/dm2-button-motion.json');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('tests/reference/play-B7Micxas.js')).digest('hex'),fixture.sourceHash);
const handlers={},win={},nodes=[];let reduced=false;
class Node {
 constructor(profile='buy'){this.profile=profile;this.isConnected=true;this.visible=true;this.disabled=false;this.style={};this.dataset={};this.animations=[];this.classList={add(){}};nodes.push(this);}
 matches(s){if(this.bulk&&s.includes(':not(.buy-max-action)'))return false;if(s==='[aria-disabled="true"],.disabled,.locked,.unaffordable')return this.disabled;if(s==='.shop-buy-btn[data-helper-type]')return !!this.dataset.helperType;if(s==='.beta-balance-continue')return !!this.anchor;if(s==='.beta-balance-close')return this.close;return s.includes('shop-buy-btn')?(s.includes('beta-balance')||this.profile==='buy'):this.profile==='popup';}
 closest(s){return s==='#mobile-shop-content'||s.includes('inert')||s==='.popup-exiting,.closing'?null:this;}
 contains(n){return n===this;}
 getClientRects(){return this.visible?[{}]:[];}
 animate(frames,options){const a={frames,options,cancelled:false,cancel(){this.cancelled=true;}};this.animations.push(a);return a;}
}
const media={get matches(){return reduced;},addEventListener(){}};
const context={window:{matchMedia:()=>media,addEventListener:(n,fn)=>win[n]=fn},document:{documentElement:{},querySelectorAll:()=>nodes,addEventListener:(n,fn)=>handlers[n]=fn},
 MutationObserver:class{constructor(fn){context.sync=fn;}observe(){}},getComputedStyle:n=>({scale:n.style.scale||'none',translate:n.style.translate||'none',visibility:n.visible?'visible':'hidden'})};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/button-motion.js','utf8'),context);
const api=context.window.DogeMinerButtonMotion;
const scale=frame=>Number(frame.transform.match(/scale\(([^)]+)\)/)[1]);
assert.deepEqual(JSON.parse(JSON.stringify(api.profiles)),fixture.profiles);
for(const profile of ['buy','popup'])for(const [i,action]of ['hover','press','release','leave','popin'].entries()){
 const actual=api.spec(profile,action,action==='leave'),expected=fixture.methods[profile][i];
 for(const k of ['k','lift','ms','ease'])assert.equal(actual[k],expected[k],profile+':'+action+':'+k);
}
let vectors=0;for(const [name,values]of Object.entries(fixture.eases))values.forEach((v,i)=>{assert.ok(Math.abs(api.ease(name,i/20)-v)<1e-12,name+':'+i);vectors++;});
const b=new Node(),event=(target=b,extra={})=>({target,button:0,pointerType:'mouse',pointerId:1,...extra});
api.refresh();handlers.pointerover(event());let a=b.animations.at(-1);assert.equal(a.options.duration,220);assert.ok(a.frames.some(x=>scale(x)>1.02),'Back overshoots');
handlers.pointerdown(event());const count=b.animations.length;handlers.mousedown(event());assert.equal(b.animations.length,count,'Compatibility mouse event does not duplicate press');assert.equal(scale(b.animations.at(-1).frames.at(-1)),.95);
handlers.pointerup(event());const release=b.animations.at(-1);assert.equal(release.options.duration,320);handlers.click(event(b,{detail:1}));assert.equal(b.animations.at(-1),release,'Click does not duplicate pointer release');
handlers.pointerout(event(b,{relatedTarget:null}));a=b.animations.at(-1);assert.equal(a.options.duration,320,'Leaving during release retains source elastic timing');assert.equal(scale(a.frames.at(-1)),1);
a.onfinish();assert.equal(b.style.transform,'translateY(0px) scale(1)');assert.equal(a.cancelled,true,'Settled animation is released');
handlers.pointerdown(event());handlers.pointercancel(event());assert.equal(scale(b.animations.at(-1).frames.at(-1)),1);
handlers.pointerdown(event());win.blur();assert.equal(b.style.transform,'translateY(0px) scale(1)');assert.equal(b.animations.at(-1).cancelled,true);
for(const type of ['touch','pen']){handlers.pointerdown(event(b,{pointerType:type}));handlers.pointerup(event(b,{pointerType:type}));a=b.animations.at(-1);assert.equal(scale(a.frames.at(-1)),1);const count=b.animations.length;handlers.click(event(b,{detail:1}));assert.equal(b.animations.length,count,'Touch click does not leave a stuck hover');}
handlers.keydown(event(b,{key:' ',repeat:false}));assert.equal(b.animations.at(-1).options.duration,80);handlers.keyup(event(b,{key:' '}));assert.equal(scale(b.animations.at(-1).frames.at(-1)),1);handlers.click(event(b,{detail:0}));
const before=b.animations.length;b.disabled=true;handlers.pointerdown(event());handlers.click(event());assert.equal(b.animations.length,before,'Disabled controls cannot animate or trigger work');b.disabled=false;
reduced=true;handlers.pointerover(event());assert.equal(b.animations.length,before);assert.equal(b.style.transform,'translateY(0px) scale(1)');reduced=false;
const p=new Node('popup');p.close=true;api.refresh();a=p.animations.at(-1);assert.equal(a.options.delay,350);assert.equal(scale(a.frames[0]),.6);assert.equal(a.options.duration,500);
p.isConnected=false;api.refresh();assert.equal(a.cancelled,true,'Detached dialogs release animations');
const bulk=new Node();bulk.bulk=true;api.refresh();handlers.pointerdown(event(bulk));handlers.click(event(bulk));assert.equal(bulk.animations.length,0,'Buy Max retains its separate animation owner');
const old=new Node();old.dataset.helperType='miningShibe';api.refresh();handlers.pointerdown(event(old));handlers.pointerup(event(old));old.isConnected=false;const replacement=new Node();replacement.dataset.helperType='miningShibe';api.refresh();const carried=replacement.animations.at(-1);assert.equal(carried.options.duration,320,'Shop redraw carries source release');handlers.pointerover(event(replacement));assert.equal(replacement.animations.at(-1),carried,'New DOM hover does not interrupt purchase release');carried.onfinish();handlers.pointerout(event(replacement));assert.equal(replacement.animations.at(-1).options.duration,260,'Settled release returns to ordinary leave timing');
assert.equal(handlers.click.toString().includes('.click('),false,'Presentation never synthesizes activation');
console.log(`PASS: ten executed DM2 motion calls, ${vectors} GSAP ease vectors, deduplicated pointer/controller/key/touch, cancel/blur, reduced motion and detached/disabled cleanup.`);

const flow=new Node('popup');flow.anchor=true;flow.dataset.flowButton='true';api.refresh();assert.equal(flow.style.transform.includes('translate(-50%,50%)'),false,'flow-layout popup buttons keep their flex position');const anchored=new Node('popup');anchored.anchor=true;api.refresh();assert.equal(anchored.style.transform.startsWith('translate(-50%,50%)'),true,'existing report anchor retained');
