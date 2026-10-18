const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../play/js/parity-test-storage.js'), 'utf8');
function storage(map = new Map()) {
    return { get length() { return map.size; }, key(index) { return [...map.keys()][index] ?? null; },
        getItem(key) { return map.get(String(key)) ?? null; }, setItem(key, value) { map.set(String(key), String(value)); },
        removeItem(key) { map.delete(String(key)); }, clear() { map.clear(); } };
}
function page({ test = true, checkpoint = 1, session = new Map(), locked = false, hostname = 'localhost' } = {}) {
    const normal = new Map([['dogeminer_ce_save', 'real-player-save'], ['music', 'on']]);
    const original = storage(normal), opened = [], played = [];
    const window = { location: { hostname, search: test ? `?parityTest=checkpoint-${checkpoint}` : '', href: 'http://localhost:8011/play/' },
        sessionStorage: storage(session), open(...args) { opened.push(args); } };
    Object.defineProperty(window, 'localStorage', { configurable: !locked, get: () => original });
    function Media() { this.muted = false; }
    Media.prototype.play = function () { played.push(this.muted); return Promise.resolve(); };
    const context = { window, URL, URLSearchParams, HTMLMediaElement: Media, console: { error() {} } };
    vm.createContext(context); vm.runInContext(source, context);
    return { window, normal, original, opened, session, Media, played };
}
const normal = page({ test: false });
assert.equal(normal.window.CEParityTesting.active, false);
assert.equal(normal.window.localStorage, normal.original);
assert.deepEqual([...normal.normal], [['dogeminer_ce_save', 'real-player-save'], ['music', 'on']]);
assert.equal(normal.window.CEParityTesting.openSandbox, undefined);
for (const hostname of ['dogeminerce.com', 'www.dogeminerce.com', 'dogeminerce.local', 'localhost.example.com', '192.168.1.10', '']) {
    const remote = page({ hostname });
    assert.equal(remote.window.CEParityTesting.active, false, hostname);
    assert.equal(remote.window.CEParityTesting.openSandbox, undefined, hostname);
    assert.equal(remote.window.localStorage, remote.original, hostname);
    assert.equal(remote.session.size, 0, hostname);
}
for (const hostname of ['localhost', '127.0.0.1', '[::1]']) assert.equal(page({ hostname }).window.CEParityTesting.active, true);

const session = new Map([['unrelated-session-key', 'keep']]);
const sandbox = page({ session });
const api = sandbox.window.CEParityTesting;
assert.equal(api.active, true);
assert.equal(api.error, undefined);
assert.notEqual(sandbox.window.localStorage, sandbox.original);
const store = sandbox.window.localStorage;
assert.equal(JSON.parse(store.getItem('dogeminer_ce_save')).dogecoins, 1000000);
assert.equal(store.getItem('music'), null, 'Real preferences are not copied into tests');
store.setItem('music', false); store.setItem('dogeminer_ce_save', 'test-progress');
assert.equal(store.getItem('music'), 'false');
assert.equal(store.length, 2);
assert.equal(store.key(99), null);
assert.equal(sandbox.original.getItem('music'), 'on');
assert.equal(sandbox.original.getItem('dogeminer_ce_save'), 'real-player-save');
const reloaded = page({ session });
assert.equal(reloaded.window.localStorage.getItem('dogeminer_ce_save'), 'test-progress', 'Refresh retains only this tab’s test progress');
const second = page({ checkpoint: 2, session });
assert.equal(second.window.CEParityTesting.checkpoint, 2);
assert.equal(JSON.parse(second.window.localStorage.getItem('dogeminer_ce_save')).dogecoins, 1000000,
    'A new checkpoint does not overwrite the previous checkpoint’s session save');
second.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-two');
assert.equal(page({ checkpoint: 2, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-two');
assert.equal(reloaded.window.localStorage.getItem('dogeminer_ce_save'), 'test-progress');
const third = page({ checkpoint: 3, session });
assert.equal(third.window.CEParityTesting.checkpoint, 3);
assert.equal(JSON.parse(third.window.localStorage.getItem('dogeminer_ce_save')).dogecoins, 1000000);
third.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-three');
assert.equal(page({ checkpoint: 3, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-three');
assert.equal(second.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-two');
const fourth = page({ checkpoint: 4, session });
assert.equal(fourth.window.CEParityTesting.checkpoint, 4);
fourth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-four');
assert.equal(page({ checkpoint: 4, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-four');
assert.equal(third.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-three');
const fifth = page({ checkpoint: 5, session });
assert.equal(fifth.window.CEParityTesting.checkpoint, 5);
fifth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-five');
assert.equal(page({ checkpoint: 5, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-five');
assert.equal(fourth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-four');
const sixth = page({ checkpoint: 6, session });
assert.equal(sixth.window.CEParityTesting.checkpoint, 6);
sixth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-six');
assert.equal(page({ checkpoint: 6, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-six');
assert.equal(fifth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-five');
const seventh = page({ checkpoint: 7, session });
assert.equal(seventh.window.CEParityTesting.checkpoint, 7);
seventh.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-seven');
assert.equal(page({ checkpoint: 7, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-seven');
assert.equal(sixth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-six', 'Joint review keeps checkpoint 6 progress separate');
const eighth = page({ checkpoint: 8, session });
assert.equal(eighth.window.CEParityTesting.checkpoint, 8);
eighth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-eight');
assert.equal(page({ checkpoint: 8, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-eight');
assert.equal(seventh.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-seven', 'Checkpoint 8 keeps the deferred review saves separate');
const ninth = page({ checkpoint: 9, session });
assert.equal(ninth.window.CEParityTesting.checkpoint, 9);
ninth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-nine');
assert.equal(page({ checkpoint: 9, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-nine');
assert.equal(eighth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-eight');
const tenth = page({ checkpoint: 10, session });
assert.equal(tenth.window.CEParityTesting.checkpoint, 10);
tenth.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-ten');
assert.equal(page({ checkpoint: 10, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-ten');
assert.equal(ninth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-nine');
assert.equal(page().window.localStorage.getItem('music'), null, 'Another tab starts a fresh sandbox');
const media = new sandbox.Media(); media.play();
assert.equal(media.muted, true);
assert.deepEqual(sandbox.played, [true], 'Media is muted before playback begins');
store.clear();
assert.equal(store.length, 0);
assert.equal(session.get('unrelated-session-key'), 'keep');
assert.equal(sandbox.original.getItem('dogeminer_ce_save'), 'real-player-save');
const failed = page({ locked: true });
assert.equal(failed.window.CEParityTesting.active, true);
assert.match(failed.window.CEParityTesting.error, /could not be isolated/);
assert.equal(failed.window.localStorage, failed.original);
assert.equal(failed.original.getItem('dogeminer_ce_save'), 'real-player-save', 'Failed isolation cannot fall back to a writable player save');
console.log('Checkpoint storage: normal saves/preferences untouched, per-tab refresh, scoped reset, pre-play mute and failure guard pass.');

const eleventh = page({ checkpoint: 11, session });
assert.equal(eleventh.window.CEParityTesting.checkpoint, 11);
eleventh.window.localStorage.setItem('dogeminer_ce_save', 'checkpoint-eleven');
assert.equal(page({ checkpoint: 11, session }).window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-eleven');
assert.equal(tenth.window.localStorage.getItem('dogeminer_ce_save'), 'checkpoint-ten');

const twelfth = page({ checkpoint:12, session });
assert.equal(twelfth.window.CEParityTesting.checkpoint,12);
twelfth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-twelve');
assert.equal(page({checkpoint:12,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-twelve');
assert.equal(eleventh.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-eleven');

const fallback=fs.readFileSync(path.resolve(__dirname,'../play/index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const landingFallback=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').match(/<script>(window\.CEParityTesting=[\s\S]*?)<\/script>/)[1];
for(let checkpoint=1;checkpoint<=69;checkpoint++){
 const context={window:{},location:{hostname:'localhost',search:'?parityTest=checkpoint-'+checkpoint},URLSearchParams};
 vm.runInNewContext(landingFallback,context);assert.equal(context.window.CEParityTesting.active,true,'Landing must fail closed for checkpoint '+checkpoint);
 assert.match(context.window.CEParityTesting.error,/could not be loaded/);
}
for(const checkpoint of [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69]){
 const context={window:{},location:{hostname:'localhost',search:'?parityTest=checkpoint-'+checkpoint},URLSearchParams};
 vm.runInNewContext(fallback,context);assert.equal(context.window.CEParityTesting.active,true);
 assert.match(context.window.CEParityTesting.error,/could not be loaded/);
}
for (const source of [fallback, landingFallback]) for (const hostname of ['dogeminerce.com', 'www.dogeminerce.com', 'dogeminerce.local', 'localhost.example.com']) {
 const context={window:{},location:{hostname,search:'?parityTest=checkpoint-69'},URLSearchParams};
 vm.runInNewContext(source,context);assert.equal(context.window.CEParityTesting.active,false,hostname);
}
for (const name of ['checkpoint-tools.js','checkpoint-scenarios.js']) {
 const window={location:{hostname:'dogeminerce.com'},CEParityTesting:{active:true}};
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'browser/'+name),'utf8'),{window});
 assert.equal(window.toggleDebugMode,undefined);assert.equal(window.ParityCheckpointTests,undefined);
}

const thirteenth=page({checkpoint:13,session});
assert.equal(thirteenth.window.CEParityTesting.checkpoint,13);
thirteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-thirteen');
assert.equal(page({checkpoint:13,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-thirteen');
assert.equal(twelfth.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-twelve');

const fourteenth=page({checkpoint:14,session});
assert.equal(fourteenth.window.CEParityTesting.checkpoint,14);
fourteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-fourteen');
assert.equal(page({checkpoint:14,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-fourteen');
assert.equal(thirteenth.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-thirteen');

const fifteenth=page({checkpoint:15,session});
assert.equal(fifteenth.window.CEParityTesting.checkpoint,15);
fifteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-fifteen');
assert.equal(page({checkpoint:15,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-fifteen');
assert.equal(fourteenth.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-fourteen');

const sixteenth=page({checkpoint:16,session});
assert.equal(sixteenth.window.CEParityTesting.checkpoint,16);
sixteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-sixteen');
assert.equal(page({checkpoint:16,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-sixteen');
assert.equal(fifteenth.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-fifteen');

const eighteenth=page({checkpoint:18,session});
assert.equal(eighteenth.window.CEParityTesting.checkpoint,18);eighteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-eighteen');
assert.equal(page({checkpoint:18,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-eighteen');
assert.equal(sixteenth.window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-sixteen');

const nineteenth=page({checkpoint:19,session});
assert.equal(nineteenth.window.CEParityTesting.checkpoint,19);
nineteenth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-nineteen');
assert.equal(page({checkpoint:19,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-nineteen');
assert.equal(page({checkpoint:18,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-eighteen');

const twentieth=page({checkpoint:20,session});assert.equal(twentieth.window.CEParityTesting.checkpoint,20);
twentieth.window.localStorage.setItem('dogeminer_ce_save','checkpoint-twenty');
assert.equal(page({checkpoint:20,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-twenty');
assert.equal(page({checkpoint:19,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-nineteen');

const twentyFirst=page({checkpoint:21,session});assert.equal(twentyFirst.window.CEParityTesting.checkpoint,21);
twentyFirst.window.localStorage.setItem('dogeminer_ce_save','checkpoint-twenty-one');
assert.equal(page({checkpoint:21,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-twenty-one');
assert.equal(page({checkpoint:20,session}).window.localStorage.getItem('dogeminer_ce_save'),'checkpoint-twenty');

for(const n of [22,23,24]){const p=page({checkpoint:n,session});p.window.localStorage.setItem("new-audio-preference",String(n));assert.equal(page({checkpoint:n,session}).window.localStorage.getItem("new-audio-preference"),String(n));assert.equal(p.original.getItem("new-audio-preference"),null);}

for(const n of [25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69]){const p=page({checkpoint:n,session});p.window.localStorage.setItem("performance-setting",String(n));assert.equal(page({checkpoint:n,session}).window.localStorage.getItem("performance-setting"),String(n));assert.equal(p.original.getItem("performance-setting"),null);}
