const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(process.env.CE_QA_OUTPUT||'scratch/release-review');
for(const directory of ['settings','mission','touch','recovery','cursor','geometry','rewards'])fs.mkdirSync(path.join(output,directory),{recursive:true});
function launch(){const chrome=process.env.CHROME_BIN||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':null);return chromium.launch({...(chrome&&fs.existsSync(chrome)?{executablePath:chrome}:{}),headless:true,args:['--mute-audio']});}
module.exports={launch,output};
