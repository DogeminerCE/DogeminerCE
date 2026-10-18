// Execute the source gate with fully populated renderer references. Definitions
// in a bundle are not proof that a feature is enabled in its ordinary session.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8');
const start=source.indexOf('var tq = ["pickaxe", "doge"]'),end=source.indexOf('\nfunction pq(',start);
let hooks=0,sways=0,unbinds=0;
const ctx={window:{dogeminer:{device:'desktop'}},rq:{},sq:{},aq:{},dq:{},lq:{},fq:false,yq:false,vq:{nx:0,ny:0},wq:{nx:0,ny:0,hover:false},mq:null,zq(){},Wq(){},Iq(){},jq(){hooks++;},Xq(){unbinds++;},Bq(){},Rq(){},Fq(){sways++;}};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);vm.runInContext(source.match(/function Yq\(\) \{[\s\S]*?\n\}/)[0],ctx);
ctx.Yq();assert.equal(ctx.fq,false);assert.equal(ctx.yq,false);assert.equal(hooks,0);assert.equal(sways,0);assert.equal(unbinds,1);
// Positive control: the same source gate can run it when a developer enables it.
vm.runInContext('cq.pickaxe.enabled=true;cq.doge.enabled=true;',ctx);ctx.Yq();assert.equal(ctx.fq,true);assert.equal(ctx.yq,true);assert.equal(hooks,1);assert.equal(sways,1);
ctx.window.dogeminer.device='phone';ctx.Yq();assert.equal(ctx.fq,false);assert.equal(ctx.yq,false);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('tests/reference/play-B7Micxas.js')).digest('hex'),'24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764');
console.log('PASS: exact source defaults disable both hover effects even with renderer references; explicit enable is a positive control, phone forces both off, pinned/live source hash is unchanged.');
