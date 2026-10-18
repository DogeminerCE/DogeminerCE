// CE release feed and guarded update checks. Uses the shared panel popup motion.
(function () {
    'use strict';
    const BUILD = 'beta-v0.1', VERSION = 'v0.1 (BETA)', MIN_CHECK = 300000;
    const node = (tag, name, text) => { const e=document.createElement(tag);e.className=name;if(text!==undefined)e.textContent=text;return e; };
    function manifest(raw) {
        if(raw?.schema!==1 || typeof raw.build!=='string' || !/^[a-zA-Z0-9._-]{1,80}$/.test(raw.build)) throw Error('Invalid release version.');
        return {build:raw.build};
    }
    function feed(raw) {
        if(raw?.schema!==1 || !Array.isArray(raw.posts) || !raw.posts.length || raw.posts.length>20) throw Error('Invalid release notes.');
        return raw.posts.map(p=>{
            if(typeof p.title!=='string'||p.title.length>160||typeof p.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!Array.isArray(p.changes)||p.changes.length>20||p.changes.some(s=>typeof s!=='string'||s.length>500))throw Error('Invalid release note.');
            return {title:p.title,date:p.date,changes:p.changes};
        });
    }
    function reloadAllowed(record, target, now=Date.now()) { return !(record?.build===target && now-record.at>=0 && now-record.at<MIN_CHECK); }
    let root=null,restore=null,available=null,cached=null,lastCheck=0,failures=0,checking=false;
    const PREF_KEY='ce-release-notes';
    function preferences(raw) { return {lastSeenBuild:typeof raw?.lastSeenBuild==='string'?raw.lastSeenBuild:BUILD,opened:raw?.opened===true,seenUpdate:typeof raw?.seenUpdate==='string'?raw.seenUpdate:null}; }
    function readPreferences(){try{return preferences(JSON.parse(localStorage.getItem(PREF_KEY)||'null'));}catch{return preferences();}}
    function badge(){
        const p=readPreferences(),unread=available?p.seenUpdate!==available:p.lastSeenBuild!==BUILD,label=document.getElementById('version-indicator');if(!label)return;
        label.classList.toggle('update-available',!!unread);
        label.textContent=VERSION+(available?' · UPDATE AVAILABLE':unread?' · NEW PATCH NOTES':'');
        label.setAttribute('title',available?'Update available · Open patch notes and update':unread?'New patch notes · Click to read':'Click to read patch notes');
        label.setAttribute('aria-label',available?'Update available. Open patch notes and update.':unread?'New patch notes. Click to read.':'Read latest patch notes.');
    }
    function acknowledge(){try{localStorage.setItem(PREF_KEY,JSON.stringify({lastSeenBuild:BUILD,opened:true,seenUpdate:available}));}catch{}badge();}

    async function fetchJSON(url) { const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Release information is unavailable.');return response.json(); }
    async function check({force=false}={}) {
        if(checking||failures>=3||(!force&&Date.now()-lastCheck<MIN_CHECK))return null;
        checking=true;lastCheck=Date.now();
        try {const next=manifest(await fetchJSON('version.json'));failures=0;available=next.build===BUILD?null:next.build;if(!available){try{sessionStorage.removeItem('ce-update-reload');}catch{}}badge();return available;}
        catch(error){failures++;return null;}finally{checking=false;}
    }
    function close({immediate=false}={}) {
        if(!root)return;const old=root;root=null;
        document.removeEventListener('keydown',restore.key,true);document.removeEventListener('focusin',restore.focus,true);
        for(const [element,inert] of restore.inert)element.inert=inert;
        document.body.style.overflow=restore.overflow;
        if(window.game){window.game.isUpdateNotesOpen=false;window.game.isPlaying=restore.playing;}
        if(immediate)window.PopupPresentation.remove(old);else{window.audioManager?.playSound('swipe_fast_low');window.PopupPresentation.close(old);}
        if(restore.active?.isConnected)restore.active.focus({preventScroll:true});restore=null;
    }
    async function open() {
        const g=window.game;if(!g||root||g.isStoryOpen||g.isBetaReportOpen||g.isOfflineReportOpen||g._dogebagReveal||document.querySelector('.modal.active,.switcher-modal.active,.dia-mission-modal.active,.dialog-overlay.active'))return false;
        root=node('div','beta-balance-overlay dialog-overlay active release-notes-overlay');root.id='release-notes';root.dataset.planet=g.currentLevel||'earth';
        const panel=node('section','beta-balance-panel release-notes-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','release-notes-title');
        const header=node('header','beta-balance-header'),title=node('h2','beta-balance-title','Latest patch notes');title.id='release-notes-title';title.tabIndex=-1;header.append(title,node('p','beta-balance-eyebrow','DOGEMINER CE · '+VERSION));
        const body=node('div','beta-balance-body release-notes-body','Loading patch notes…'),footer=node('footer','beta-balance-footer'),error=node('p','beta-balance-error');error.hidden=true;error.setAttribute('role','alert');
        const done=node('button','beta-balance-continue','CLOSE');done.type='button';done.dataset.flowButton='true';done.onclick=()=>close();footer.append(error,done);
        if(available){const reload=node('button','beta-balance-continue','RELOAD TO UPDATE');reload.type='button';reload.dataset.flowButton='true';reload.onclick=()=>{
            let previous;try{previous=JSON.parse(sessionStorage.getItem('ce-update-reload')||'null');}catch{}
            if(!reloadAllowed(previous,available)){error.textContent='An update reload was already attempted. Please try again shortly.';error.hidden=false;return;}
            if(window.saveManager?.commitEncounterProgress?.()!==true){error.textContent='Your progress could not be saved. Please try again.';error.hidden=false;return;}
            try{sessionStorage.setItem('ce-update-reload',JSON.stringify({build:available,at:Date.now()}));}catch{error.textContent='Reload protection is unavailable. Please try again.';error.hidden=false;return;}location.reload();
        };footer.prepend(reload);}
        body.tabIndex=0;body.setAttribute('aria-label','Patch notes, scroll to read all changes');
        panel.append(header,body,footer);root.append(panel);
        restore={active:document.activeElement,overflow:document.body.style.overflow,playing:g.isPlaying,inert:[...document.body.children].map(e=>[e,e.inert])};
        g.releaseDrill?.();g.isMouseDown=false;g.isSpaceDown=false;g.endSwing?.();g.isUpdateNotesOpen=true;g.isPlaying=false;
        restore.key=e=>{e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const buttons=[body,...panel.querySelectorAll('button')];const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}};
        restore.focus=e=>{if(root&&!root.contains(e.target))title.focus({preventScroll:true});};
        for(const [e] of restore.inert)e.inert=true;document.body.style.overflow='hidden';document.documentElement.append(root);window.PopupPresentation.mount(root);document.addEventListener('keydown',restore.key,true);document.addEventListener('focusin',restore.focus,true);title.focus({preventScroll:true});acknowledge();
        const current=root;try{cached ||= feed(await fetchJSON('updates.json'));if(root!==current)return true;body.textContent='';for(const post of cached){const article=node('article','release-note'),h=node('h3','',post.title),date=node('time','',post.date),list=node('ul','');date.dateTime=post.date;for(const change of post.changes)list.append(node('li','',change));article.append(h,date,list);body.append(article);}}
        catch{if(root===current)body.textContent='Patch notes are unavailable. Close this window and try again.';}
        return true;
    }
    function install(){const label=document.getElementById('version-indicator');if(!label)return;label.setAttribute('role','button');label.tabIndex=0;label.title='Latest patch notes';badge();label.addEventListener('click',open);label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});check();window.addEventListener('focus',()=>check());document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});setInterval(check,1800000);}
    window.DogeMinerReleaseNotes=Object.freeze({BUILD,VERSION,manifest,feed,preferences,reloadAllowed,check,open,close});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
