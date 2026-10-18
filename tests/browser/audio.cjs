const fs=require('node:fs'),assert=require('node:assert/strict'),{launch,output}=require('./harness.cjs');
(async()=>{const browser=await launch(),rows=[],errors=[];try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');await page.waitForFunction(()=>window.game?._bootComplete,{},{polling:100});await page.locator('#loading-screen').waitFor({state:'hidden'});
 await page.evaluate(()=>{
  window.__audioTrace=[];const original=audioManager.playSound.bind(audioManager);
  audioManager.playSound=(name,options)=>{const id=original(name,options);__audioTrace.push({name,options:options||{},registered:!!audioManager.soundEffects[name],played:id!==false});return id;};
  window.__enableAudio=()=>{Object.assign(audioManager,{soundEnabled:true,rockSoundsEnabled:true,backgroundAudioEnabled:true,_audioSuspended:false});game.soundEnabled=true;game.musicEnabled=false;audioManager.applyAudioPolicy();__audioTrace=[];};
 });
 const preset=async scene=>{await page.evaluate(scene=>{ParityCheckpointTests.run('feature-preview',{scene});__enableAudio();game.isPlaying=false;},scene);};
 const trace=()=>page.evaluate(()=>__audioTrace);
 for(const [width,height]of [[1280,800],[375,812]]){
  await page.setViewportSize({width,height});
  await preset('diamond-stacks');await page.evaluate(()=>game.collectDiamond(document.querySelector('.diamond-stack')));
  let events=await trace();assert.ok(events.some(e=>e.name==='diamond1'&&e.options.volume===.2));assert.ok(!events.some(e=>e.name==='longSparkle'));rows.push({width,case:'field diamond',events});
  await preset('holiday-easter');await page.evaluate(()=>{if(!game._seasonalEgg)game.spawnHiddenEgg('1');if(!game._seasonalEgg)throw Error('No preview egg');game.collectHiddenEgg(game._seasonalEgg.id);});
  events=await trace();assert.ok(events.some(e=>e.name==='friendlytwinkle'));rows.push({width,case:'Easter egg',events});
  await preset('rock-capacity');await page.evaluate(()=>{
   const pick=Object.entries(game.pickaxeFactory.templates).find(([,v])=>v.name==='Normal Pickaxe')||Object.entries(game.pickaxeFactory.templates)[0];
   const fortune=Object.entries(game.fortuneFactory.templates).find(([,v])=>/cookie/i.test(v.name))||Object.entries(game.fortuneFactory.templates)[0];
   const rewards=[{type:'coins',amount:10},{type:'diamonds',amount:2},{type:'pickaxe',item:game.pickaxeFactory.generatePickaxe(pick[0],100,0)},{type:'fortune',item:game.fortuneFactory.generateFromTemplate(fortune[0])}];
   const roll=game.generateDogebagContents;game.generateDogebagContents=()=>rewards.shift();game.restoreDogebagStacks({earth:{0:4}});game.openDogebagModal(document.querySelector('.dogebag-stack'));game.openDogebagContents();game.generateDogebagContents=roll;
  });await page.waitForFunction(()=>game._dogebagReveal?.ready,{},{polling:100});
  await page.evaluate(()=>{const view=game._dogebagReveal;game.showDogebagReward(view.rewards.findIndex(r=>r.type==='fortune'));game.dogebagLoot();game.dogebagEquip();});
  events=await trace();for(const name of ['collectItem','pickup','select2','getCoins','diamond1'])assert.ok(events.some(e=>e.name===name),name);assert.ok(!events.some(e=>e.name==='receivePickaxe'));rows.push({width,case:'batch reveal / select / claim / equip',events});
  await preset('mystery-fortunes');await page.evaluate(()=>{
   game.closeFortuneModal();game.isSupporter=true;game.mysteryBoxObtained=true;game.mysteryBoxEvolutionPending=false;game._mysteryEntryAt=0;game._mysteryBoxReadyAt=0;game.mysteryBoxTimerRemaining=0;
   const pick=Object.entries(game.pickaxeFactory.templates)[0],fortune=Object.entries(game.fortuneFactory.templates)[0];
   const rewards=[{type:'pickaxe',item:game.pickaxeFactory.generatePickaxe(pick[0],100,0)},{type:'fortune',item:game.fortuneFactory.generateFromTemplate(fortune[0])}];
   const roll=game._rollMysteryBoxReward;game._rollMysteryBoxReward=()=>rewards.shift();game.openMysteryBoxModal();game.openMysteryBoxRewards();game._rollMysteryBoxReward=roll;
  });await page.waitForFunction(()=>game._dogebagReveal?.ready,{},{polling:100});
  events=await trace();assert.ok(events.some(e=>e.name==='longSparkle'&&e.options.volume===.75));assert.ok(events.some(e=>e.name==='receivePickaxe'&&e.options.volume===.2));assert.ok(events.some(e=>e.name==='select2'));rows.push({width,case:'Mystery Box jump / two reveals',events});
  await page.evaluate(()=>game.closeDogebagModal());
  await preset('rock-capacity');await page.evaluate(()=>{
   const pick=Object.entries(game.pickaxeFactory.templates)[0],fortune=Object.entries(game.fortuneFactory.templates)[0];
   const rewards=[{type:'coins',amount:10},{type:'diamonds',amount:2},{type:'pickaxe',item:game.pickaxeFactory.generatePickaxe(pick[0],100,0)},{type:'fortune',item:game.fortuneFactory.generateFromTemplate(fortune[0])}];
   const roll=game.generateDogebagContents;game.generateDogebagContents=()=>rewards.shift();game.restoreDogebagStacks({earth:{0:4}});
   const node=document.querySelector('.dogebag-stack');for(let i=0;i<4;i++)if(!game.claimAutomaticBag({node,planet:'earth'}))throw Error('Automatic claim failed');game.generateDogebagContents=roll;
  });await page.waitForTimeout(1100);events=await trace();
  for(const name of ['grabBag','receivePickaxe','select2','receiveStash','getCoins','diamond1'])assert.ok(events.some(e=>e.name===name),name);
  assert.ok(!events.some(e=>e.name==='pickup'));rows.push({width,case:'four automatic loot types',events});
  await preset('rick-visit');await page.evaluate(()=>{game.hideRick();game.dropRick(180,240);});events=await trace();assert.ok(events.some(e=>e.name==='short_sparkle'&&e.options.volume===.3));
  await page.evaluate(()=>game.despawnRick({animate:true}));events=await trace();assert.ok(events.some(e=>e.name==='swipe_fast_low'&&e.options.volume===.25));rows.push({width,case:'Rick placement / exit',events});
  await preset('tool-fusion');await page.evaluate(()=>{const pair=DogeMinerSunDogeFusion.pair(game);if(!pair||!game.commitSunDogeFusion(pair))throw Error('Fusion failed');});
  events=await trace();assert.ok(events.some(e=>e.name==='receivePickaxe'&&e.options.volume===.3));rows.push({width,case:'SunDoge fusion',events});
  await preset('rock-capacity');await page.evaluate(()=>game.buyMaxHelpers('miningShibe',3));await page.waitForTimeout(800);events=await trace();
  assert.ok(events.some(e=>e.name==='ching'&&e.options.rate>1&&e.played));
  await page.evaluate(()=>{__audioTrace=[];audioManager.backgroundAudioEnabled=false;audioManager._windowFocused=false;game.buyMaxHelpers('miningShibe',3);});await page.waitForTimeout(800);
  const mutedEvents=await trace();assert.ok(mutedEvents.some(e=>e.name==='ching'));assert.ok(mutedEvents.filter(e=>e.name==='ching').every(e=>!e.played));
  await page.evaluate(()=>{audioManager.backgroundAudioEnabled=true;audioManager._windowFocused=true;});rows.push({width,case:'Buy Max pitch / background mute',events,mutedEvents});
 }
 const decoded=await page.evaluate(async()=>{
  const paths=[...new Set(Object.values(audioManager.soundEffects).flat().map(h=>h._src))];
  for(const key of ['radio','carStart','carLoop','burnDrive','brake','warp','warpExit','lightningSmall','lightningLate','lightningBig','complete','missionLoop'])paths.push(timeTravelManager._audio(key).src);
  const results=[];for(const path of [...new Set(paths)]){const r=await fetch(path);if(!r.ok)throw Error(path+': '+r.status);const b=await Howler.ctx.decodeAudioData(await r.arrayBuffer());if(!(b.duration>0))throw Error(path);results.push({path:new URL(path,location.href).pathname,seconds:b.duration});}return results;
 });
 const policy=await page.evaluate(()=>{__audioTrace=[];audioManager.soundEnabled=false;const off=audioManager.playSound('friendlytwinkle');audioManager.soundEnabled=true;audioManager.rockSoundsEnabled=false;const rock=audioManager.playSound('pickaxe'),loot=audioManager.playSound('diamond1');audioManager.backgroundAudioEnabled=false;audioManager._windowFocused=false;const blurred=audioManager.playSound('select2');return {off,rock,loot:loot!==false,blurred,masterMute:Howler._muted};});
 assert.deepEqual(policy,{off:false,rock:false,loot:true,blurred:false,masterMute:true});
 assert.ok(rows.flatMap(row=>row.events).every(event=>event.registered));assert.deepEqual(errors,[]);
 fs.writeFileSync(output+'/audio-results.json',JSON.stringify({rows,decoded,policy,errors},null,2));console.log(JSON.stringify({passed:true,featureCases:rows.length,decodedClips:decoded.length,settingsPolicy:true}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
