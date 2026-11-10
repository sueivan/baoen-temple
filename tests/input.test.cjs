const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
class Element {
  constructor() { this.listeners={}; this.style={}; this.captured=new Set(); this.firstElementChild={style:{}}; }
  addEventListener(name,fn) { (this.listeners[name] ||= []).push(fn); }
  emit(name,event={}) { for(const fn of this.listeners[name] || []) fn({button:0,preventDefault(){},target:{tagName:'DIV'},...event}); }
  getBoundingClientRect() { return {left:0,top:0,width:100,height:100}; }
  setPointerCapture(id) { this.captured.add(id); }
  hasPointerCapture(id) { return this.captured.has(id); }
  releasePointerCapture(id) { this.captured.delete(id); }
  querySelector() { return this.firstElementChild; }
}
function makeInput() {
  const root=new Element(); root.Temple={};
  const scene=new Element(),pad=new Element(),joystick=new Element();
  const elements={'move-pad':pad,joystick};
  const scope={window:root,document:{getElementById:id=>elements[id]}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/input.js'),'utf8'),scope);
  const input=new root.Temple.Input(scene,{active:()=>true,action(){},home(){}});
  return {input,pad,scene,root};
}
test('mobile pad stops immediately on release, cancellation and lost capture', () => {
  for (const ending of ['pointerup','pointercancel','lostpointercapture']) {
    const {input,pad}=makeInput();
    pad.emit('pointerdown',{pointerId:1,clientX:50,clientY:12});
    assert.equal(input.read().z,-1);
    pad.emit(ending,{pointerId:1});
    assert.equal(input.read().z,0);
    assert.equal(input.pointer,null);
  }
});
test('a second finger cannot take over or accidentally stop the active joystick', () => {
  const {input,pad,scene}=makeInput();
  pad.emit('pointerdown',{pointerId:1,clientX:50,clientY:12});
  scene.emit('pointerdown',{pointerId:2,clientX:70,clientY:70});
  scene.emit('pointercancel',{pointerId:2});
  assert.equal(input.pointer.id,1);
  assert.equal(input.read().z,-1);
  pad.emit('pointerup',{pointerId:1});
  assert.equal(input.read().z,0);
});
test('losing focus clears movement and pointer capture', () => {
  const {input,pad,root}=makeInput();
  pad.emit('pointerdown',{pointerId:3,clientX:88,clientY:50});
  root.emit('blur');
  assert.equal(input.read().x,0);
  assert.equal(pad.captured.size,0);
});
