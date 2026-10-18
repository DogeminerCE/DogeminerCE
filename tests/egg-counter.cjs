const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');
// Execute DM2's original location enumeration and counter renderer as an oracle.
const oracle={dogeminer:{pauseEvents:false,device:'desktop',player:{easter:{eh:0,fg:0,found:[]}},game:{assets:{easter:Object.fromEntries(Array.from({length:9},(_,i)=>['easter/count'+(i+1),'easter/count'+(i+1)]))}}},LU:undefined,
 a:class{constructor(texture){this.texture=texture;this.position={};this.scale={};}on(){}destroy(){this.destroyed=true;}},cz:()=>({addChild(){},removeChild(){}})};
vm.createContext(oracle);
for(const name of ['YU','QU'])vm.runInContext(source.match(new RegExp('function '+name+'\\(\\) \\{[\\s\\S]*?\\n\\}'))[0],oracle);
const nodes=new Map();
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};}
 append(child){this.children.push(child);if(child.id)nodes.set(child.id,child);}
 get firstElementChild(){return this.children[0];}
 set src(value){this.attrs.src=value;}
 getAttribute(key){return this.attrs[key];}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(){}
}
nodes.set('left-panel',new Element('div'));
const root={DogeMinerGame:class{},DogeMinerStories:{registerNarrative(){}},document:{body:{dataset:{}},createElement:tag=>new Element(tag),getElementById:id=>nodes.get(id),querySelector:()=>null,querySelectorAll:()=>[...nodes.values()].filter(n=>n.className==='seasonal-scene')}};root.window=root;
root.DogeMinerSeasonal={active:g=>g.event,income:g=>({multiplier:(1+g.seasonal.easter.count/100)*(g.seasonal.easter.golden?2:1)})};
vm.createContext(root);vm.runInContext(fs.readFileSync('play/js/seasonal-runtime.js','utf8'),root);
const g=new root.DogeMinerGame();g.event='easter';g.syncSeasonalSettings=()=>{};g.seasonal={easter:{count:0,golden:false}};
assert.equal(oracle.YU().length,9);
for(let count=0;count<=9;count++){
 oracle.dogeminer.player.easter.eh=count;oracle.QU();g.seasonal.easter.count=count;g.renderSeasonal();
 const button=nodes.get('seasonal-egg-progress');assert.equal(!!button&&!button.hidden,count>0);
 if(!count)continue;
 assert.ok(button.firstElementChild.getAttribute('src').endsWith(oracle.LU.texture+'.webp'));
 assert.equal(button.firstElementChild.width,154);assert.equal(button.firstElementChild.height,count===9?75:35);
 assert.equal(oracle.LU.position.x,7);assert.equal(oracle.LU.position.y,82);
 assert.match(button.getAttribute('aria-label'),new RegExp('^'+count+'/9 Easter eggs'));
}
// DM2 selects count9 artwork independently of the saved golden-story receipt.
g.seasonal.easter.golden=true;g.renderSeasonal();assert.match(nodes.get('seasonal-egg-progress').firstElementChild.getAttribute('src'),/count9\.webp$/);
assert.match(nodes.get('seasonal-egg-progress').getAttribute('aria-label'),/Golden egg earned/);
oracle.dogeminer.device='phone';oracle.QU();assert.equal(oracle.LU.scale.x,.75);assert.equal(oracle.LU.position.y,65);
g.event='halloween';g.renderSeasonal();assert.equal(nodes.get('seasonal-egg-progress').hidden,true);
g.event='easter';g.seasonal.easter.count=0;g.renderSeasonal();assert.equal(nodes.get('seasonal-egg-progress').hidden,true);
console.log('PASS: executed DM2 nine-location/counter oracle agrees for all ten count states, golden receipt independence, accessible count, and off-season/zero hiding.');
