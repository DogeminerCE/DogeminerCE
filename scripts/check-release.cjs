const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
process.chdir(path.join(__dirname,'..'));
const failures=[],missing=[],sources=[...fs.readdirSync('play/js').filter(n=>n.endsWith('.js')).map(n=>'play/js/'+n),'index.html','play/index.html','play/styles.css','styles.css'];
let parsed=0,assets=0;const allPaths=new Set();
function checkSyntax(name,source){const module=/^\s*(?:export\s|import\s)/m.test(source);const r=cp.spawnSync(process.execPath,[...(module?['--input-type=module']:[]),'--check'],{input:source,encoding:'utf8'});parsed++;if(r.status!==0)failures.push(name+': '+r.stderr.trim());}
for(const name of [...sources.filter(n=>n.endsWith('.js')),...fs.readdirSync('scripts').filter(n=>n.endsWith('.cjs')||n.endsWith('.js')).map(n=>'scripts/'+n),...fs.readdirSync('functions').filter(n=>n.endsWith('.js')).map(n=>'functions/'+n),...fs.readdirSync('tests/browser').filter(n=>n.endsWith('.js')).map(n=>'tests/browser/'+n)])checkSyntax(name,fs.readFileSync(name,'utf8'));
for(const name of ['index.html','play/index.html']){let i=0;for(const m of fs.readFileSync(name,'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())checkSyntax(name+' inline '+(++i),m[1]);}
function exactFile(name){let here='.';for(const segment of name.split('/')){if(!segment||segment==='.')continue;if(segment==='..'){here=path.dirname(here);continue;}if(!fs.readdirSync(here).some(n=>n.normalize('NFC')===segment.normalize('NFC')))return false;here=path.join(here,segment);}return fs.existsSync(here)&&fs.statSync(here).isFile();}
for(const name of sources){const text=fs.readFileSync(name,'utf8');for(const m of text.matchAll(/(["'])([^"'\r\n]*?\.(?:webp|png|jpg|gif|svg|mp3|ogg|wav|mp4|woff2?|ttf|cur))\1/g)){
 const value=m[2];if(!/^(?:\.\.\/)?(?:assets|fonts)\//.test(value)||value.includes('${')||value.includes('\\'))continue;
 const dest=path.normalize(path.join(name==='index.html'?'.':'play',decodeURIComponent(value)));if(allPaths.has(dest))continue;allPaths.add(dest);assets++;if(!exactFile(dest))missing.push({source:name,asset:dest});
}}
const html=fs.readFileSync('play/index.html','utf8'),game=fs.readFileSync('play/js/game.js','utf8'),controller=fs.readFileSync('play/js/controller.js','utf8');
const main=fs.readFileSync('play/js/main.js','utf8');
if(/toggleDebugMode|debugGrantAll|debug-console|Backslash|PerformanceMonitor/.test(main))failures.push('Developer menu or shortcut is present in the production entry point.');
if(fs.existsSync('play/js/parity-testing.js')||/debug-console|parity-tools-launcher/.test(fs.readFileSync('play/styles.css','utf8')))failures.push('Checkpoint tools must stay outside the production runtime payload.');
if(/pickaxe-tree|PickaxeTree/.test(html+game+controller))failures.push('Removed Pickaxe Tree is still present in the runtime.');
for(const id of ['hats-tab-btn','mobile-hats-tab-btn','hats-tab','mobile-hats-tab'])if(!html.includes('id="'+id+'" hidden'))failures.push('Hats surface not hidden: '+id);
if(/panelTabs = \[[^\]]*'hats'/.test(controller))failures.push('Controller can still navigate to Hats.');
const feed=JSON.parse(fs.readFileSync('play/updates.json')),manifest=JSON.parse(fs.readFileSync('play/version.json'));
const packageManifest=fs.readFileSync('packaging/windows/AppxManifest.xml','utf8'),packageVersion=packageManifest.match(/<Identity\s[^>]*\bVersion="([^"]+)"/)?.[1],versionParts=packageVersion?.split('.').map(Number);
if(!/^(0|[1-9]\d{0,4})(\.(0|[1-9]\d{0,4})){3}$/.test(packageVersion||'')||versionParts.some(n=>n>65535)||versionParts[0]<1||versionParts[3]!==0)failures.push('Invalid Microsoft Store package version.');
else {const previous=[0,55,0,0],changed=versionParts.findIndex((n,i)=>n!==previous[i]);if(changed<0||versionParts[changed]<previous[changed])failures.push('Windows package version must advance beyond Alpha 0.55.0.0.');}
if(/\$indexContent|\$rawVersion/.test(fs.readFileSync('scripts/bundle-msix.ps1','utf8')))failures.push('Windows package version must come from AppxManifest, not the game label.');
if(!fs.readFileSync('play/js/release-notes.js','utf8').includes("'"+manifest.build+"'"))failures.push('Feed/client build mismatch.');
if(/Pickaxe Tree|Hats navigation/.test(feed.posts.flatMap(p=>p.changes).join('\n')))failures.push('Release notes advertise a deferred feature.');
for(const row of missing)failures.push('Missing/case-mismatched asset: '+row.asset+' ('+row.source+')');
console.log(JSON.stringify({parsed,referencedAssets:assets,packageVersion,failures},null,2));if(failures.length)process.exitCode=1;
