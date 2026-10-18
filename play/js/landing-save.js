// A landing import is reviewed first, then handed to the same in-game transaction.
(function(){
    'use strict';
    const PENDING=window.CEParityTesting?.active?'ce-parity-checkpoint-'+window.CEParityTesting.checkpoint+':pending-import-v1':'dogeminer_ce_pending_import_v1';
    let consumeJob=null;
    function gameUrl(requestId){
        const url=new URL('play/',window.location.href),params=new URLSearchParams(window.location.search);
        if(window.CEParityTesting?.active)url.searchParams.set('parityTest',params.get('parityTest'));
        if(requestId)url.searchParams.set('pendingImport',requestId);
        return url;
    }
    function hasLocalSave(){
        for(const key of ['dogeminer_ce_save','dogeminer_ce_backup'])try{
            const text=localStorage.getItem(key);if(!text)continue;
            const save=JSON.parse(text);window.BetaSaveMigration.validate(save);
            if(!save.balanceVersion||save.balanceVersion===window.DogeMinerBalance.VERSION)return true;
        }catch(_){}
        return false;
    }
    function stage(text,review){
        const fingerprint=window.DogeMinerDM2Import.fingerprint(text);
        if(review.fingerprint!==fingerprint)throw new Error('The selected file changed. Choose it again.');
        const requestId=window.crypto?.randomUUID?.()||fingerprint+'-'+Date.now()+'-'+Math.random().toString(36).slice(2);
        sessionStorage.setItem(PENDING,JSON.stringify({version:1,text,fingerprint,requestId,createdAt:Date.now()}));
        return gameUrl(requestId);
    }
    async function consume(manager){
        if(consumeJob)return consumeJob;
        consumeJob=consumeOnce(manager);
        try{return await consumeJob;}finally{consumeJob=null;}
    }
    async function consumeOnce(manager){
        const url=new URL(window.location.href),requested=url.searchParams.get('pendingImport');
        if(!requested)return {imported:false};
        const cleanup=()=>{try{sessionStorage.removeItem(PENDING);url.searchParams.delete('pendingImport');window.history.replaceState(null,'',url.href);}catch(_){/* Durable receipt prevents a repeat on reload. */}};
        if(!manager._saveBlocked&&manager.game.importReceipt?.requestId===requested){cleanup();return {imported:true,recovered:true};}
        let pending;
        try{
            pending=JSON.parse(sessionStorage.getItem(PENDING)||'null');
            if(pending?.version!==1||pending.requestId!==requested||typeof pending.text!=='string'||window.DogeMinerDM2Import.fingerprint(pending.text)!==pending.fingerprint)
                throw new Error('The selected import is unavailable. Choose the file again in Settings.');
            const imported=await manager.importSaveText(pending.text,{confirm:false,requestId:pending.requestId});
            if(!imported)throw new Error('The import was not applied. Your previous progress was kept.');
            cleanup();
            return {imported:true};
        }catch(error){
            // Keep the staged original on failure; a reload can retry the same
            // reviewed file, and the previous local save remains recoverable.
            return {imported:false,error};
        }
    }
    function mount(){
        const start=document.getElementById('start-game'),button=document.getElementById('landing-import');
        if(!start||!button)return;
        if(window.CEParityTesting?.active&&window.CEParityTesting.error){start.removeAttribute('href');button.disabled=true;document.getElementById('landing-import-status').textContent=window.CEParityTesting.error;return;}
        if(window.CEParityTesting?.active&&new URLSearchParams(location.search).get('landingFixture')==='new')localStorage.clear();
        const refresh=()=>{start.textContent=hasLocalSave()?'CONTINUE':'START';start.href=gameUrl().href;};
        refresh();window.addEventListener('storage',refresh);window.addEventListener('pageshow',refresh);
        const input=document.getElementById('landing-import-file'),dialog=document.getElementById('landing-save-review'),status=document.getElementById('landing-import-status');
        let draft=null;button.addEventListener('click',()=>{input.value='';input.click();});
        input.addEventListener('change',async()=>{
            const file=input.files?.[0];if(!file)return;status.textContent='';
            try{
                const text=await file.text(),review=window.DogeMinerDM2Import.inspect(text),s=review.summary;
                document.getElementById('landing-save-title').textContent='Import '+review.format+' Save';
                document.getElementById('landing-save-summary').textContent='Timeline '+s.timeline+' · '+new Intl.NumberFormat().format(s.coins)+' Dogecoins\n'+s.pickaxes+' pickaxes · '+s.fortunes+' fortunes'+(s.helpers===undefined?'':' · '+s.helpers+' helpers');
                const notes=document.getElementById('landing-save-notes');notes.replaceChildren();
                for(const text of review.notes){const li=document.createElement('li');li.textContent=text;notes.append(li);}
                draft={text,review};dialog.showModal();
            }catch(error){draft=null;status.textContent=error.message||'This save could not be read. Your progress was kept.';}
        });
        dialog.addEventListener('close',()=>{draft=null;});
        document.getElementById('landing-save-confirm').addEventListener('click',()=>{
            if(!draft)return;
            try{const url=stage(draft.text,draft.review);window.location.href=url.href;}
            catch(error){status.textContent='The file could not be staged in this browser. Import it from the game’s Settings instead.';dialog.close();}
        });
    }
    window.DogeMinerLandingSave=Object.freeze({hasLocalSave,gameUrl,stage,consume,pendingKey:PENDING});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
