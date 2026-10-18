const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let timerId=0;const timers=new Map(),sounds=[],roots=[];
class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.events={};this.className='';this._text='';this.classList={add:k=>this.className+=' '+k,contains:k=>this.className.split(' ').includes(k)};}
 set textContent(s){this._text=String(s);this.children=[];}get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 append(...nodes){for(const n of nodes){this.children.push(n);n.parentElement=this;}}appendChild(n){this.append(n);return n;}
 setAttribute(k,v){this[k]=v;}addEventListener(k,fn){(this.events[k]||=[]).push(fn);}
 click(){for(const fn of this.events.click||[])fn({});}remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);this.parentElement=null;}
 querySelectorAll(selector){return this.children.flatMap(n=>[...(selector==='button'&&n.tagName==='BUTTON'?[n]:[]),...n.querySelectorAll(selector)]);}
 find(className){return this.children.flatMap(n=>[n,...n.children]).find(n=>n.className.split(' ').includes(className));}
}
const body=new Node('body'),head=new Node('head'),findId=(node,id)=>node.id===id?node:node.children.map(n=>findId(n,id)).find(Boolean);
const context={window:{addEventListener(){},audioManager:{playSound:s=>sounds.push(s)}},document:{body,head,createElement:tag=>new Node(tag),getElementById:id=>findId(body,id)||findId(head,id)},innerWidth:1280,innerHeight:800,
 setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id)};
vm.createContext(context);vm.runInContext(fs.readFileSync('play/js/notifications.js','utf8'),context);const Manager=vm.runInContext('NotificationManager',context),game={notificationsEnabled:true,isMobileDevice:()=>false},manager=new Manager(game);
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8'),a=source.indexOf('  fc = class {'),b=source.indexOf('\n  yc = new Set()',a);const sourceTimers=[],sourceCalls=[];
const oracle={uc:true,setTimeout:(fn,ms)=>{sourceTimers.push({fn,ms});return 1;},ue:(_node,ms)=>sourceCalls.push(['exit',ms])};vm.createContext(oracle);vm.runInContext('var '+source.slice(a,b).trim().replace(/,$/,';'),oracle);const Prototype=vm.runInContext('fc.prototype',oracle);
for(const [data,expected]of [[{},6000],[{closetimer:9000},9000],[{stay:true},null]]){const o=Object.assign(Object.create(Prototype),{data,closePopup(){}});sourceTimers.length=0;o.runTimers();assert.equal(sourceTimers[0]?.ms??null,expected);const n=manager.createNotification({...data,info:'test'});assert.equal(n._notificationDuration,expected===6000?4500:expected??0,'User default is 1.5 seconds shorter; custom/staying timers retain their semantics');}
let clicks=0,ends=0;const n=manager.showEvent({id:'source',title:'UPGRADE',info:'Found New Upgrade',details:'<green>MUCH fast!</green> <img src=x>',icon:'assets/helper.webp',onClick(){clicks++;},onEnd(){ends++;}});
assert.equal(n.dataset.type,'info');assert.equal(n.textContent.includes('MUCH fast!'),true);assert.equal(n.textContent.includes('<img src=x>'),true,'Markup stays inert text');assert.equal(n.children.length,2);assert.equal(n.find('notification-close'),undefined,'No red close button or extra keyboard stop');assert.equal(sounds.at(-1),'biblip');
n.find('notification-content').click();n.find('notification-content').click();assert.equal(clicks,1);assert.equal(ends,1);assert.equal(timers.get(n._removeTimer).ms,700);assert.ok(n.querySelectorAll('button').every(b=>b.disabled));
for(const close of [false,true]){let c=0,e=0;const o=Object.assign(Object.create(Prototype),{isclosing:false,data:{id:'x',onClick(){c++;}},contentStage:{destroy(){}},onEnd(){e++;},onClosePopup(){}});sourceTimers.length=0;o.closePopup(close);o.closePopup(close);assert.equal(c,close?0:1);assert.equal(e,1);assert.equal(sourceTimers[0].ms,700);assert.equal(sourceCalls.at(-1)[1],300);}
let dismissed=0;const d=manager.showEvent({info:'Dismiss',onClick(){dismissed++;}});manager.removeNotification(d,'close');assert.equal(dismissed,0);
let timed=0;const t=manager.showEvent({info:'Timeout',onClick(){timed++;}});assert.equal(timers.get(t._expiry).ms,4500);timers.get(t._expiry).fn();assert.equal(timed,0);
manager.pause();manager.queue('queued','info');manager.showEvent({title:'QUEUED',info:'second'});assert.equal(manager.pending.length,2);manager.resume();assert.equal(manager.pending.length,0);assert.equal(typeof manager.queue,'function','Queue never shadows its method');
game.notificationsEnabled=false;assert.equal(manager.showInfo('hidden'),null);assert.ok(manager.showEvent({id:'reduced-motion',system:true,stay:true,silent:true,info:'warning'}));game.notificationsEnabled=true;
manager.clearAll();assert.equal(manager.notifications.length,0);assert.equal(findId(body,'notifications').children.length,0);
// Production navigation uses the saved slot and rejects stale context.
function Game(){};context.DogeMinerGame=Game;context.window.notificationManager={showEvent:d=>d};let level=1,active='',focused=0;const offers=['miningShibe',null,null];const slot={dataset:{},isConnected:true,getClientRects:()=>[{}],focus(){focused++;},scrollIntoView(){}};
context.window.shopManager={getNextHelperUpgrade:()=>({level,upgradeIcon:'assets/icon.webp'})};context.window.uiManager={updateUpgradeContent(){}};context.window.switchMainTab=tab=>active=tab;context.document.querySelectorAll=()=>[slot];vm.runInContext(fs.readFileSync('play/js/event-notifications.js','utf8'),context);
const g=Object.assign(new Game(),{currentLevel:'earth',helperUpgradeOffers:{earth:offers},isMobileDevice:()=>false});const data=g.showFoundUpgradeNotification('miningShibe');data.onClick();assert.equal(active,'upgrades');[...timers.values()].at(-1).fn();assert.equal(focused,1);offers[0]=null;data.onClick();assert.equal(focused,1);offers[0]='miningShibe';g.currentLevel='moon';data.onClick();assert.equal(focused,1);
console.log('PASS: executed source timers/click/close/end semantics, safe rich fields, icons, requested4.5s default/source cleanup, queue/preferences and saved-slot/stale navigation.');
