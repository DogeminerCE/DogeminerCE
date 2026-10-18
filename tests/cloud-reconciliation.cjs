const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const plain=x=>JSON.parse(JSON.stringify(x));
function env(){
    const storage=new Map(),timers=[],messages=[],fault={},remote={data:null,writes:0},ctx={console:{log(){},warn(){},error(){}},document:{readyState:'loading',addEventListener(){}},setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},localStorage:{getItem:k=>storage.get(k)??null,setItem(k,v){if(fault.key===k)throw Error('rejected');storage.set(k,String(v));},removeItem:k=>storage.delete(k)},window:{}};
    vm.createContext(ctx);for(const name of ['balance-data','balance','beta-migration','save-reconciliation','save','cloud-save'])vm.runInContext(fs.readFileSync('play/js/'+name+'.js','utf8'),ctx);
    const Save=vm.runInContext('SaveManager',ctx),Cloud=vm.runInContext('CloudSaveManager',ctx),policy=ctx.window.DogeMinerSaveReconciliation;
    const snapshot=(extra={})=>({version:'1.0.0',balanceVersion:'dm2-beta-1',timestamp:100,timelineNumber:1,dogecoins:30,totalMined:100,totalClicks:1,pickaxeInventory:[],fortuneInventory:[],...extra});
    const game={...snapshot(),_currencyFlightEpoch:0,isPlaying:true,_bootComplete:true,setSupporterStatus(v){this.isSupporter=v;}};
    const manager=Object.assign(Object.create(Save.prototype),{game,saveKey:'save',backupKey:'backup',lastSave:100,_saveBlocked:false,_loadInProgress:false,
        createSaveData(){return snapshot({...plain(game),timestamp:Date.now()});},
        _applySaveData(data){Object.assign(game,plain(data));game._currencyFlightEpoch++;},
    });
    const cloud=Object.assign(Object.create(Cloud.prototype),{currentUser:{uid:'a'},_accountEpoch:1});
    Object.assign(ctx.window,{game,saveManager:manager,notificationManager:Object.fromEntries(['showSuccess','showInfo','showWarning','showError'].map(k=>[k,m=>messages.push(m)])),firebase:{db:{},doc:(_db,_collection,uid)=>({uid}),async getDoc(){return {exists:()=>!!remote.data,data:()=>plain(remote.data)};},async runTransaction(_db,callback){const writes=[];const result=await callback({get:async()=>({exists:()=>!!remote.data,data:()=>plain(remote.data)}),set:(_ref,value)=>writes.push(value)});if(fault.remote)throw Error('network');for(const w of writes){remote.data={...remote.data,...plain(w)};remote.writes++;}return result;}}});
    storage.set('save',JSON.stringify(snapshot()));storage.set('backup',storage.get('save'));
    return {ctx,storage,timers,messages,fault,remote,game,manager,cloud,policy,snapshot};
}
(async()=>{
    const e=env(),{snapshot:s,policy:p}=e;
    // Execute the source's actual selection function, including both tie modes.
    const src=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8'),body=src.slice(src.indexOf('function Gc('),src.indexOf('\nvar Nc',src.indexOf('function Gc(')));
    const oracle=vm.runInNewContext('('+body+')'),source=s=>s&&({timeline:s.timelineNumber||1,alltimecoins:s.totalMined,savedate:s.timestamp});
    for(const timeline of [1,2,8])for(const earned of [0,100,1e30])for(const stamp of [1,100,1000]){
        const a=s(),b=s({timelineNumber:timeline,totalMined:earned,timestamp:stamp});
        const sa=source(a),sb=source(b);assert.equal(p.compare(a,b)<0,oracle(sa,sb,true)===sb);
    }
    assert.equal(p.valid(s({dogecoins:NaN}),e.manager),false);assert.equal(p.valid(s({balanceVersion:'future'}),e.manager),false);assert.equal(p.valid(s({fortuneInventory:[{stats:[{value:Infinity}]}]}),e.manager),false);
    e.remote.data={gameData:s({dogecoins:9999,totalMined:50,timestamp:999}),isSupporter:true};
    assert.equal(await e.cloud.loadFromCloud(),'local');assert.equal(e.game.totalMined,100);assert.equal(e.game.isSupporter,true);
    e.remote.data={gameData:s({timelineNumber:2,totalMined:1,timestamp:2,fortuneInventory:[{name:'Fixed reward',stats:[{value:777}]}]}),isSupporter:true};
    assert.equal(await e.cloud.loadFromCloud(),'cloud');assert.equal(e.game.timelineNumber,2);assert.equal(e.game.fortuneInventory[0].stats[0].value,777);
    assert.equal(JSON.parse(e.storage.get('save')).timelineNumber,2);assert.equal(JSON.parse(e.storage.get('dogeminer_ce_before_cloud_v1')).timelineNumber,1);
    for(const key of ['save','backup','dogeminer_ce_before_cloud_v1']){
        const e=env(),before=[...e.storage];e.remote.data={gameData:e.snapshot({timelineNumber:3})};e.fault.key=key;
        assert.equal(await e.cloud.loadFromCloudSilent(),'error');assert.equal(e.game.timelineNumber,1);assert.deepEqual([...e.storage],before);assert.equal(e.manager._saveBlocked,false);
    }
    const invalid=env();invalid.remote.data={gameData:invalid.snapshot({pickaxeInventory:[{baseDPC:-1}]})};assert.equal(await invalid.cloud.loadFromCloud(),'invalid-cloud');assert.equal(invalid.manager._saveBlocked,false);
    const busy=env();busy.remote.data={gameData:busy.snapshot({totalMined:200})};busy.game._dogebagReveal={};assert.equal(await busy.cloud.loadFromCloud(),'deferred');assert.equal(busy.game.totalMined,100);busy.game._dogebagReveal=null;busy.game.totalMined=300;busy.timers.shift()();assert.equal(busy.game.totalMined,300,'Recompare earned progress after the reward closes');
    const stale=env();let resolve;stale.ctx.window.firebase.getDoc=()=>new Promise(r=>resolve=r);const read=stale.cloud.loadFromCloudSilent();stale.cloud.currentUser={uid:'b'};resolve({exists:()=>true,data:()=>({gameData:stale.snapshot({timelineNumber:9})})});assert.equal(await read,'stale');assert.equal(stale.game.timelineNumber,1);
    const reset=env();let finish;reset.ctx.window.firebase.getDoc=()=>new Promise(r=>finish=r);const request=reset.cloud.loadFromCloudSilent();reset.game._currencyFlightEpoch++;finish({exists:()=>true,data:()=>({gameData:reset.snapshot({timelineNumber:9})})});assert.equal(await request,'stale');
    const write=env();write.remote.data={gameData:write.snapshot({totalMined:1}),isSupporter:true,totalTipAmount:42};write.game.isSupporter=true;
    assert.equal(await write.cloud.saveToCloudSilent(),'saved');assert.equal(write.remote.writes,1);assert.equal(write.remote.data.isSupporter,true);assert.equal(write.remote.data.totalTipAmount,42);assert.equal('isSupporter' in write.remote.data.gameData,false);
    write.remote.data.gameData=write.snapshot({timelineNumber:10});assert.equal(await write.cloud.saveToCloud(),'cloud-newer');assert.equal(write.remote.writes,1);assert.equal(write.game.timelineNumber,10);
    const malformed=env();malformed.remote.data={gameData:{broken:true}};assert.equal(await malformed.cloud.saveToCloudSilent(),'invalid-cloud');assert.equal(malformed.remote.writes,0);
    for(const dialog of ['notes','import']){
        const pending=env();pending.remote.data={gameData:pending.snapshot({timelineNumber:2})};
        if(dialog==='notes')pending.game.isUpdateNotesOpen=true;else pending.ctx.window.controllerManager={_dialogOpen:true};
        assert.equal(await pending.cloud.loadFromCloudSilent(),'deferred');assert.equal(pending.game.timelineNumber,1);
        pending.game.isUpdateNotesOpen=false;if(pending.ctx.window.controllerManager)pending.ctx.window.controllerManager._dialogOpen=false;
        assert.equal(await pending.cloud.loadFromCloudSilent(),'cloud');assert.equal(pending.game.timelineNumber,2);
    }
    const blocked=env();blocked.manager._saveBlocked=true;assert.equal(await blocked.cloud.saveToCloudSilent(),'invalid-local');assert.equal(blocked.remote.writes,0);
    blocked.storage.set('save','original corrupt local bytes');blocked.remote.data={gameData:blocked.snapshot({timelineNumber:2})};assert.equal(await blocked.cloud.loadFromCloudSilent(),'cloud');assert.equal(blocked.storage.get('dogeminer_ce_before_cloud_v1'),'original corrupt local bytes','Cloud recovery preserves the rejected original too');
    const retry=env();retry.remote.data={gameData:retry.snapshot({totalMined:1}),isSupporter:true};
    retry.ctx.window.firebase.runTransaction=async(_db,callback)=>{
        await callback({get:async()=>({exists:()=>true,data:()=>plain(retry.remote.data)}),set(){}});
        retry.remote.data.gameData=retry.snapshot({timelineNumber:7});
        return callback({get:async()=>({exists:()=>true,data:()=>plain(retry.remote.data)}),set(){throw Error('Must not overwrite the concurrent newer save');}});
    };
    assert.equal(await retry.cloud.saveToCloudSilent(),'cloud-newer');assert.equal(retry.game.timelineNumber,7);
    console.log('PASS: executed source priority/tie oracle, spent-wallet ordering, protected rewards, account/reset races, deferred reward recompare, atomic primary/backup/recovery rollback, malformed saves, transactional cloud conflict and separate supporter ownership.');
})().catch(e=>{console.error(e);process.exit(1);});
