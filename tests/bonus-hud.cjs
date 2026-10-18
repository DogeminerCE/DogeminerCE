const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let now=1000000,seq=0;const timeouts=new Map(),ids=new Map();
class Node{
 constructor(tag='div',cls=''){this.tagName=tag;this.className=cls;this.children=[];this.style={};this.attributes={};this.classList={toggle:(c,on)=>{this.className=this.className.split(' ').filter(x=>x!==c).concat(on?[c]:[]).join(' ');}};}
 append(...children){for(const n of children){this.children.push(n);n.parentElement=this;if(n.id)ids.set(n.id,n);}}remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);if(this.id)ids.delete(this.id);this.parentElement=null;}
 set innerHTML(html){this.children=[];for(const c of ['bcb-icon','bcb-mult','bcb-time','bcb-hourglass'])if(html.includes(c))this.append(new Node('span',c));}
 querySelector(selector){return this.children.find(n=>n.className.split(' ').includes(selector.slice(1)))||this.children.map(n=>n.querySelector(selector)).find(Boolean);}
 getAttribute(k){return this.attributes[k]??null;}set src(v){this.attributes.src=v;}setAttribute(k,v){this.attributes[k]=v;}
}
const stats=new Node(),wallet=new Node(),dps=new Node(),amount=new Node(),coins=new Node(),icon=new Node('img','stat-icon');amount.id='dps-amount';coins.id='dogecoin-amount';dps.append(amount,icon);wallet.append(coins);stats.id='stats-display';ids.set(stats.id,stats);ids.set(amount.id,amount);ids.set(coins.id,coins);
const context={window:{},document:{getElementById:id=>ids.get(id),createElement:tag=>new Node(tag)},Date:class extends Date{static now(){return now;}},getComputedStyle:()=>({backgroundColor:'rgba(255,245,185,0.8)'}),setTimeout:(fn,ms)=>{timeouts.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timeouts.delete(id)};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/bonus-hud.js','utf8'),context);const api=context.window.DogeMinerBonusHud;
const src=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');const oracle={};vm.createContext(oracle);vm.runInContext(src.slice(src.indexOf('function GQ(e)'),src.indexOf('var zQ,',src.indexOf('function GQ(e)'))),oracle);
for(const value of [undefined,null,NaN,Infinity,-3,0,1,99,100,101,999,1000,60000,60001,120000])assert.equal(api.formatDuration(value),oracle.FQ(value));
for(const remaining of [0,1,99,100,101,59999,60000])assert.equal(api.formatDuration(remaining),oracle.FQ(oracle.NQ({bonusstart:100,bonustime:60000},60100-remaining)));
const game={_bootComplete:true,currentLevel:'earth',bonusCoinBuffTier:1,bonusCoinClaimCount:1,bonusCoinBuffMultiplier:1.5,bonusCoinBuffEndTime:now+60000,getBonusCoinTiers:()=>[null,{sprite:'level 1.webp',name:'Golden Bonus'}],getCurrentBonusCoinTier:()=>({sprite:'legacy.webp',name:'Kept legacy'})};
api.render(game);assert.equal(ids.get('bonus-coin-buff').querySelector('.bcb-mult').textContent,'+50%');assert.equal(ids.get('bonus-coin-buff').querySelector('.bcb-time').textContent,'60.0 s');assert.match(icon.src||icon.getAttribute('src'),/persec_icon_bonus/);assert.match(wallet.className,/bonus-wallet-active/);
now+=101;api.render(game);assert.equal(ids.get('bonus-coin-buff').querySelector('.bcb-time').textContent,'59.9 s');
api.showFeedback(game,'BONUS ACTIVATED!');assert.equal(dps.children.at(-1).textContent,'BONUS ACTIVATED!');assert.equal([...timeouts.values()].at(-1).ms,1110);
game.bonusCoinClaimCount++;game.bonusCoinBuffEndTime=now+60000;api.render(game);assert.equal(ids.has('bonus-coin-buff'),false,'Replacement row uses source500ms gap');now+=499;api.render(game);assert.equal(ids.has('bonus-coin-buff'),false);now++;api.render(game);assert.ok(ids.has('bonus-coin-buff'));
game.bonusCoinBuffMultiplier=2;game.bonusCoinBuffTier=0;game.bonusCoinClaimCount++;api.render(game);now+=500;api.render(game);assert.equal(ids.get('bonus-coin-buff').querySelector('.bcb-mult').textContent,'+100%','Legacy multiplier displayed without reroll');
const snapshot={mult:game.bonusCoinBuffMultiplier,end:game.bonusCoinBuffEndTime,claims:game.bonusCoinClaimCount};api.clear(game);assert.equal(ids.has('bonus-coin-buff'),false);assert.doesNotMatch(wallet.className,/bonus-wallet-active/);assert.match(icon.getAttribute('src'),/persec_icon\.webp$/);assert.deepEqual({mult:game.bonusCoinBuffMultiplier,end:game.bonusCoinBuffEndTime,claims:game.bonusCoinClaimCount},snapshot);
api.render(game);assert.ok(ids.has('bonus-coin-buff'),'Silent reload resumes immediately');now=game.bonusCoinBuffEndTime;api.render(game);assert.equal(ids.has('bonus-coin-buff'),false);
console.log('PASS: executed source remaining/tenths formatter, structured hourglass/boost row, bonus DPS icon/tint/pulse,500ms replacement,1110ms feedback, legacy values and complete clear without save mutation.');
