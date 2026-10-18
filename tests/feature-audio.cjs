const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let nextId=0;
class Howl {
    constructor(options){this.options=options;this.base=options.volume;this.voices=new Map();this.muted=false;}
    play(){const id=++nextId;this.voices.set(id,{volume:this.base,rate:1});return id;}
    volume(value,id){if(value===undefined)return this.base;if(id)this.voices.get(id).volume=value;else this.base=value;}
    rate(value,id){this.voices.get(id).rate=value;}
    mute(value){this.muted=value;}
    stop(){this.voices.clear();}
}
const ctx={Howl,console,window:{},document:{hidden:false}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('play/js/audio.js','utf8'),ctx);
const Audio=vm.runInContext('AudioManager',ctx),audio=new Audio();ctx.window.audioManager=audio;audio.loadSoundEffects();
const canonical={diamond1:'diamond1.mp3',select2:'select2.wav',friendlytwinkle:'friendlytwinkle.mp3',radio_start:'radio_start.wav',
    pop1:'pop1.wav',grab_helper:'grab_helper.wav',pickup_1:'pickup_1.wav',receive_pickaxe:'receive_pickaxe.mp3',
    receive_stash:'receive_stash.mp3',collect_item_1:'collect_item_1.wav',long_sparkle:'long_sparkle.wav',
    short_sparkle:'short_sparkle.wav','check.wav':'check.wav',receiveItem:'receive_pickaxe.mp3'};
for(const [name,file]of Object.entries(canonical))assert.equal(path.basename(audio.soundEffects[name].options.src[0]),file);
for(const voice of new Set(Object.values(audio.soundEffects).flat()))assert.ok(fs.existsSync(path.join('play',voice.options.src[0])));
// Run the original main-audio API and claim router as an independent cue/gain oracle.
const source=fs.readFileSync('tests/reference/play-B7Micxas.pretty.js','utf8'),events=[];
const oracle={hi:{main:{play(name){events.push({name,volume:this._volume});return events.length;}}},Gi:()=>true,pi:['pick1'],ai:()=>0,dogeminer:{sound:{}}};
vm.createContext(oracle);
for(const name of ['xi','WC'])vm.runInContext(source.match(new RegExp('function '+name+'\\([^]*?\\n\\}'))[0],oracle);
oracle.dogeminer.sound.play=oracle.xi;
for(const type of ['coins','diamonds','pick','fortune']){
    oracle.WC(type);const expected=events.at(-1),voice=audio.soundEffects[expected.name],id=audio.playSound(expected.name,{volume:expected.volume});
    assert.equal(path.parse(voice.options.src[0]).name,expected.name);assert.equal(voice.voices.get(id).volume,expected.volume);
}
audio.setSoundVolume(.4);
const first=audio.playSound('ching',{volume:.3,rate:1.6});assert.deepEqual(audio.soundEffects.ching.voices.get(first),{volume:.12,rate:1.6});
const second=audio.playSound('ching');assert.deepEqual(audio.soundEffects.ching.voices.get(second),{volume:.2,rate:1});
audio.rockSoundsEnabled=false;audio.applyAudioPolicy();
for(const name of ['pickaxe','hit_hard','hit_ground','rockhit_large']){assert.equal(audio.playSound(name),false);for(const voice of [audio.soundEffects[name]].flat())assert.equal(voice.muted,true);}
assert.notEqual(audio.playSound('diamond1'),false);assert.notEqual(audio.playSound('friendlytwinkle'),false);
audio.backgroundAudioEnabled=false;audio._windowFocused=false;assert.equal(audio.playSound('pop1'),false);
audio._windowFocused=true;audio.soundEnabled=false;assert.equal(audio.playSound('select2'),false);
audio.soundEnabled=true;audio.suspendAllAudio();assert.equal(audio.playSound('collect_item_1'),false);
assert.equal(audio.playSound('unregistered-effect'),false);
// Cinematic voices use the same preference/master-volume policy and actual source files.
ctx.Audio=class{constructor(src){this.src=src;this.currentTime=0;this.paused=true;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}};
ctx.document.getElementById=()=>null;
vm.runInContext(fs.readFileSync('play/js/time-travel.js','utf8'),ctx);
const Travel=vm.runInContext('TimeTravelManager',ctx),travel=Object.create(Travel.prototype);
Object.assign(travel,{game:{soundEnabled:true},_sounds:{},_activeLoops:[],_timers:[]});ctx.window.timeTravelManager=travel;
Object.assign(audio,{soundEnabled:true,_audioSuspended:false,backgroundAudioEnabled:true,_windowFocused:true});
for(const [key,file,gain]of [['radio','radio_start.wav',.2],['carStart','car_start.mp3',.35],['carLoop','car_driving_loop.mp3',.1],
 ['burnDrive','burn_and_drive.mp3',.3],['brake','brake.wav',.3],['warpExit','ln_exit.wav',.4],['missionLoop','test_mission_loop_cool.wav',.1],
 ['lightningSmall','ln_small.wav',.5],['lightningLate','ln_short-late.mp3',.5],['lightningBig','ln_big.mp3',.5]]){
 const clip=travel._audio(key);assert.equal(path.basename(clip.src),file);assert.ok(fs.existsSync(path.join('play',clip.src)));assert.equal(clip.volume,gain*.4);
}
travel._playSound('lightningLate',.25);assert.equal(travel._sounds.lightningLate.volume,.1);
travel._playLoop('carLoop');assert.equal(travel._sounds.carLoop.paused,false);travel._teardownCutscene();assert.ok(Object.values(travel._sounds).every(clip=>clip.paused));
assert.equal(travel._audio('unknown'),null);
const completion=[];travel._rewardsShown=false;travel._buildRewards=()=>[];travel._presentReward=()=>{};travel._playSound=key=>completion.push(key);
travel._showRewards();travel._showRewards();assert.deepEqual(completion,['complete'],'Mission Passed cue activates once when rewards are presented');
console.log('PASS: source-executed claim cues/gains, real file paths, source aliases, per-voice master volume/pitch reset, mining isolation and background/suspend controls.');
