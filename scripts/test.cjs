const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
process.chdir(path.join(__dirname,'..'));
let failures=0;const files=fs.readdirSync('tests').filter(n=>n.endsWith('.cjs')).sort();
for(const file of files){const r=cp.spawnSync(process.execPath,[path.join('tests',file)],{encoding:'utf8',timeout:60000});if(r.status!==0){failures++;console.error('FAIL '+file+'\n'+r.stdout+r.stderr);}else console.log('PASS '+file);}
console.log(`${files.length-failures}/${files.length} test suites passed.`);if(failures)process.exitCode=1;
