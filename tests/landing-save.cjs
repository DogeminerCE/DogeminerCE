const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const local=new Map(),session=new Map(),fault={},location={href:'http://localhost:8011/?parityTest=checkpoint-48',search:'?parityTest=checkpoint-48'};
const ctx={URL,URLSearchParams,console,document:{readyState:'complete',getElementById:()=>null},localStorage:{getItem(k){if(fault.read)throw Error('blocked');return local.get(k)??null;}},sessionStorage:{getItem:k=>session.get(k)??null,setItem(k,v){if(fault.write)throw Error('quota');session.set(k,String(v));},removeItem(k){if(fault.cleanup)throw Error('blocked cleanup');session.delete(k);}},window:{location,CEParityTesting:{active:true,checkpoint:48},history:{replaceState(_a,_b,url){location.href=url;location.search=new URL(url).search;}}}};
vm.createContext(ctx);for(const name of ['balance-data','balance','beta-migration','lz-string','dm2-import-data','seasonal','dm2-import','landing-save'])vm.runInContext(fs.readFileSync('play/js/'+name+'.js','utf8'),ctx);
const api=ctx.window.DogeMinerLandingSave,importer=ctx.window.DogeMinerDM2Import,text=fs.readFileSync('tests/fixtures/import-sample.doge','utf8'),review=importer.inspect(text);
assert.equal(review.summary.timeline,3);assert.equal(review.summary.helpers,3);assert.equal(review.saveData,undefined,'Landing review never applies a partially prepared save');
assert.equal(api.hasLocalSave(),false);local.set('dogeminer_ce_save','broken');assert.equal(api.hasLocalSave(),false);local.set('dogeminer_ce_backup',JSON.stringify({version:'1.0.0',timestamp:1,dogecoins:0,totalMined:0,totalClicks:0}));assert.equal(api.hasLocalSave(),true);fault.read=true;assert.equal(api.hasLocalSave(),false);delete fault.read;
assert.equal(api.gameUrl().pathname,'/play/');assert.equal(api.gameUrl().searchParams.get('parityTest'),'checkpoint-48');assert.ok(api.pendingKey.startsWith('ce-parity-checkpoint-48:'));
fault.write=true;assert.throws(()=>api.stage(text,review));assert.equal(session.size,0);delete fault.write;assert.throws(()=>api.stage('changed',review));
(async()=>{
 let calls=0,reject=false;
 const manager={game:{},_saveBlocked:false,async importSaveText(text,opts){calls++;assert.equal(opts.confirm,false);assert.equal(text,fs.readFileSync('tests/fixtures/import-sample.doge','utf8'));if(reject)throw Error('local commit failed');this.game.importReceipt={version:1,requestId:opts.requestId,fingerprint:importer.fingerprint(text)};return true;}};
 function enter(url){location.href=url.href;location.search=url.search;}
 enter(api.stage(text,review));const first=location.href;const [a,b]=await Promise.all([api.consume(manager),api.consume(manager)]);assert.equal(a.imported,true);assert.equal(b.imported,true);assert.equal(calls,1);assert.equal(new URL(location.href).searchParams.has('pendingImport'),false);assert.equal(session.size,0);
 // A new user-approved import of the same file is a distinct request.
 enter(api.stage(text,review));assert.notEqual(location.href,first);await api.consume(manager);assert.equal(calls,2);
 enter(api.stage(text,review));reject=true;const result=await api.consume(manager);assert.equal(result.imported,false);assert.ok(result.error);assert.equal(session.size,1);reject=false;
 fault.cleanup=true;const applied=await api.consume(manager);assert.equal(applied.imported,true);const count=calls;assert.equal(session.size,1);assert.equal((await api.consume(manager)).recovered,true);assert.equal(calls,count,'Failed temporary cleanup cannot repeat the durable import or replace its recovery backup');delete fault.cleanup;await api.consume(manager);assert.equal(session.size,0);
 enter(api.stage(text,review));const pending=JSON.parse(session.get(api.pendingKey));pending.text='changed';session.set(api.pendingKey,JSON.stringify(pending));assert.equal((await api.consume(manager)).imported,false);
 console.log('PASS: read-only landing review, valid primary/backup Continue detection, blocked storage, relative/private navigation, staged-file integrity, single consume, intentional re-import, failed-commit retry and durable cleanup replay protection.');
})().catch(e=>{console.error(e);process.exit(1);});
