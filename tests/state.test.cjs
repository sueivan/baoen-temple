const test = require('node:test');
const assert = require('node:assert/strict');
const state = require('../assets/js/state.js');

test('broken storage and null data produce usable defaults', () => {
  assert.equal(state.sanitize(null).lang,'zh-Hant');
  assert.equal(state.read({getItem(){throw Error('blocked');}}).sound,false);
  assert.equal(state.read({getItem(){return '{bad';}}).quality,'auto');
});
test('stored preferences accept only supported languages, quality and booleans', () => {
  assert.deepEqual(state.sanitize({lang:'<script>',quality:'ultra',sound:'false',ambient:1,stats:{bow:999}}),{
    lang:'zh-Hant',quality:'auto',sound:false,ambient:false
  });
});
test('valid preferences survive a round trip and quota errors do not crash the app', () => {
  let raw;
  const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}};
  const data=state.sanitize({lang:'en',quality:'low',sound:true});
  assert.equal(state.write(data,storage),true);
  assert.deepEqual(state.read(storage),data);
  assert.equal(state.write(data,{setItem(){throw Error('quota');}}),false);
});
