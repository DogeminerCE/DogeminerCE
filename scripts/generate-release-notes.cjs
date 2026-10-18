// Build the player feed and its auditable Alpha -> Beta coverage from one source.
const fs=require('node:fs'),assert=require('node:assert/strict');
const catalog=JSON.parse(fs.readFileSync('docs/beta-v0.1-release-notes.json','utf8'));
const backlog=JSON.parse(fs.readFileSync('docs/dm2-parity/remaining-parity-backlog.json','utf8'));
const entries=backlog.groups.flatMap(group=>group.entries),implemented=entries.filter(entry=>entry.status==='Implemented');
const coverage={};
for(let p=0;p<catalog.posts.length;p++)for(let n=0;n<catalog.posts[p].changes.length;n++){
    const row=catalog.posts[p].changes[n];
    for(const id of row.ids){assert.ok(implemented.some(entry=>entry.id===id),'Unknown or unfinished note '+id);(coverage[id]||=[]).push({post:p+1,bullet:n+1});}
}
assert.deepEqual(implemented.map(entry=>entry.id).sort(),Object.keys(coverage).sort(),'Every completed parity feature needs a release-note reference.');
const feed={schema:1,posts:catalog.posts.map(post=>({...post,changes:post.changes.map(row=>row.text)}))};
assert.ok(feed.posts.length<=20);for(const post of feed.posts){assert.ok(post.changes.length<=20);for(const text of post.changes)assert.ok(text.length<=500);}
fs.writeFileSync('play/updates.json',JSON.stringify(feed,null,2)+'\n');
fs.writeFileSync('play/version.json',JSON.stringify({schema:1,build:catalog.build})+'\n');
fs.writeFileSync('docs/beta-v0.1-release-note-coverage.json',JSON.stringify({schema:1,baseline:catalog.baseline,build:catalog.build,implementedEntries:implemented.length,coverage,omitted:entries.filter(e=>e.status==='Intentionally omitted').map(e=>({id:e.id,title:e.title,reason:e.implementationDescription||e.description})),sources:catalog.sources},null,2)+'\n');
let md='# Alpha v0.055 → Beta v0.1\n\nPlayer-facing changes compared with the repository’s `Alpha` tag (`'+catalog.baseline.commit+'`), which displays `v0.055 (ALPHA)`. Release build: `'+catalog.build+'`.\n\n';
for(const post of feed.posts)md+='## '+post.title.replace('Beta v0.1 — ','')+'\n\n'+post.changes.map(text=>'- '+text).join('\n')+'\n\n';
md+='## Coverage and review\n\nThe in-game feed and this document are generated from [the editable note catalog](beta-v0.1-release-notes.json). [Coverage](beta-v0.1-release-note-coverage.json) maps all '+implemented.length+' completed parity entries to their exact bullets. The development log, migration report and checkpoint guides provide implementation/test evidence. The static browser title and disabled source hover feature are retained omissions. Existing CE design policies and the physical-device verification queue remain recorded in the [parity backlog](dm2-parity/remaining-parity-backlog.md).\n';
fs.writeFileSync('docs/beta-v0.1-release-notes.md',md);
console.log(JSON.stringify({posts:feed.posts.length,bullets:feed.posts.reduce((sum,post)=>sum+post.changes.length,0),covered:implemented.length,build:catalog.build}));
