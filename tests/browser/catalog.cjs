const fs=require('node:fs'),assert=require('node:assert/strict'),{launch,output}=require('./harness.cjs');
(async()=>{const browser=await launch();try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');await page.waitForFunction(()=>game?._bootComplete,{},{polling:100});const result=await page.evaluate(async()=>{
 const assets=new Set(),add=value=>{if(typeof value==='string'&&/\.(?:webp|png|jpe?g|gif)$/i.test(value))assets.add(value);};
 for(const t of Object.values(game.pickaxeFactory.templates)){add(t.idleSprite);add(t.activeSprite);}
 for(const t of Object.values(game.fortuneFactory.templates))add(t.sprite);
 for(const [type,tiers]of Object.entries(shopManager.shopData.helperUpgrades))for(const tier of [...tiers,{level:10000}]){const p=game.getHelperSpritePaths(type,tier.level);add(p.idle);add(p.mining);}
 const list=[...assets],failures=[];for(let i=0;i<list.length;i+=8)await Promise.all(list.slice(i,i+8).map(src=>new Promise(resolve=>{const image=new Image();image.onload=resolve;image.onerror=()=>{failures.push(src);resolve();};image.src=src;})));
 return {pickaxes:Object.keys(game.pickaxeFactory.templates).length,fortunes:Object.keys(game.fortuneFactory.templates).length,assets:list.length,failures,loadErrors:[...game.pickaxeFactory.loadErrors,...game.fortuneFactory.loadErrors]};
 });assert.deepEqual(result.failures,[]);assert.deepEqual(result.loadErrors,[]);assert.deepEqual(errors,[]);fs.writeFileSync(output+'/catalog-results.json',JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({passed:true,...result}));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
