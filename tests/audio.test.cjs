const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function makeAudio(AudioContext){
  const root={Temple:{},AudioContext};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/audio.js'),'utf8'),{window:root});
  return new root.Temple.Audio();
}
test('muted practice sounds never create or require an audio context',()=>{
  const audio=makeAudio();audio.wood();audio.bell();audio.bead();
  assert.equal(audio.context,null);assert.equal(audio.enabled,false);
});
test('muting during audio activation cannot be undone by a late resume',async()=>{
  let release;
  class AudioContext{
    constructor(){this.state='suspended';this.currentTime=0;this.destination={};}
    createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){}};}
    resume(){return new Promise(resolve=>{release=()=>{this.state='running';resolve();};});}
  }
  const audio=makeAudio(AudioContext);
  const pending=audio.enable(true);
  await audio.enable(false);
  release();await pending;
  assert.equal(audio.enabled,false);
});
