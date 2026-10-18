const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let focused=true,overlay=false,hits=0,releases=0,returns=0;const listeners={},windowListeners={};
const document={hidden:false,hasFocus:()=>focused,activeElement:null,querySelector:()=>overlay?{}:null,getElementById:()=>null,addEventListener:(name,fn)=>listeners[name]=fn};
const root={document,Date,Math,console,window:{addEventListener:(name,fn)=>windowListeners[name]=fn}};vm.createContext(root);
const source=fs.readFileSync('play/js/game.js','utf8');vm.runInContext(source,root);const Game=vm.runInContext('DogeMinerGame',root);
const game=Object.assign(Object.create(Game.prototype),{isPlaying:true,processClick(){hits++;},releaseDrill(){releases++;},endSwing(){returns++;}});root.__testGame=game;
const keyboard=source.slice(source.indexOf('        // Keyboard events with click rate limiting'),source.indexOf('        // Auto-save is now handled by SaveManager'));
vm.runInContext('(function(){'+keyboard+'}).call(__testGame)',root);
const plain={closest:()=>null},control={closest:()=>({})};const event=target=>({code:'Space',target,preventDefault(){this.prevented=true;}});
let e=event(control);listeners.keydown(e);assert.equal(hits,0);assert.equal(e.prevented,undefined,'Typing and focused controls keep their native Space action');listeners.keyup(e);assert.equal(e.prevented,undefined);
e=event(plain);listeners.keydown(e);assert.equal(hits,1);assert.equal(game.isSpaceDown,true);assert.equal(e.prevented,true);windowListeners.blur();assert.equal(game.isSpaceDown,false);assert.equal(game.isMouseDown,false);assert.equal(releases,1);
for(const flag of ['isIntroPlaying','isCutscenePlaying','isTransitioning','isBetaReportOpen','isOfflineReportOpen','isStoryOpen','isUpdateNotesOpen','isMysteryBoxOpen','_dogebagReveal','_sunDogeFusion']){game[flag]=true;assert.equal(game.canUseMiningInput(event(plain)),false,flag);delete game[flag];}
overlay=true;assert.equal(game.canUseMiningInput(event(plain)),false);overlay=false;focused=false;assert.equal(game.canUseMiningInput(event(plain)),false);focused=true;document.hidden=true;game.isMouseDown=true;listeners.visibilitychange();assert.equal(game.isMouseDown,false);assert.equal(game.canUseMiningInput(event(plain)),false);document.hidden=false;assert.equal(game.canUseMiningInput(event(plain)),true);
// Production hit entry points, including controller/direct calls, share the guard.
let direct=Object.assign(Object.create(Game.prototype),{isPlaying:true,isStoryOpen:true});assert.doesNotThrow(()=>direct.processClick());assert.doesNotThrow(()=>direct.handleRockClick());
// Execute DM2's actual held-space adapter for blur/visibility release behavior.
const src=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8'),keys={},events={};let down=0,up=0;
const oracle={document:{hidden:false,body:{addEventListener:(k,fn)=>keys[k]=fn,removeEventListener(){}},addEventListener:(k,fn)=>keys[k]=fn,removeEventListener(){}},window:{addEventListener:(k,fn)=>events[k]=fn,removeEventListener(){}},_n:()=>false,KB:'#cg-pause-screen'};vm.createContext(oracle);
for(const name of ['JB','QB','$B'])vm.runInContext(src.match(new RegExp('function '+name.replace('$','\\$')+'\\([^]*?\\n\\}'))[0],oracle);
oracle.$B({onDown:()=>down++,onUp:()=>up++});const sourceEvent={keyCode:32,target:{closest:()=>null},preventDefault(){}};keys.keydown(sourceEvent);events.blur();keys.keyup(sourceEvent);assert.equal(down,1);assert.equal(up,1);keys.keydown(sourceEvent);oracle.document.hidden=true;keys.visibilitychange();assert.equal(up,2);
assert.equal(returns,2);console.log('PASS: real keyboard handler preserves typing/control Space, shared mining/dialog guards, blur/visibility cancellation and executed DM2 held-input release oracle.');
