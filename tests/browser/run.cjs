const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
process.chdir(path.join(__dirname,'../..'));const {output}=require('./harness.cjs');
const selected=process.argv.slice(2),files=selected.length?selected:['production-debug','audio','release-scope','settings','cursor','mission','touch','recovery','rewards','geometry'],results=[];
for(const file of files){if(!/^[a-z-]+$/.test(file))throw Error('Invalid suite');const r=cp.spawnSync(process.execPath,[path.join(__dirname,file+'.cjs')],{encoding:'utf8',timeout:300000});const row={suite:file,code:r.status,output:(r.stdout+r.stderr).trim()};results.push(row);console.log(JSON.stringify(row));fs.writeFileSync(output+'/browser-regression-results.json',JSON.stringify(results,null,2));if(r.status!==0)break;}
if(results.length!==files.length||results.some(r=>r.code!==0))process.exitCode=1;
