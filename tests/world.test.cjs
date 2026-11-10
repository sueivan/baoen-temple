const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const THREE = require('../assets/vendor/three.r128.min.js');
const methods = ['fillRect','strokeRect','beginPath','moveTo','lineTo','stroke','arc','fill','fillText'];
function makeWorld() {
  const context = {createLinearGradient:() => ({addColorStop(){}})};
  for (const method of methods) context[method] = () => {};
  const scope = { THREE, window:{Temple:{}}, document:{createElement:() => ({width:0,height:0,getContext:() => context})} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/world.js'),'utf8'),scope);
  const scene = new THREE.Scene();
  return {scene, world:scope.window.Temple.createWorld(scene)};
}
test('scene builds with the bundled Three.js, finite geometry and efficient batching', () => {
  const {scene,world} = makeWorld();
  let vertices = 0;
  scene.traverse(object => {
    if (!object.isMesh) return;
    const positions = object.geometry.getAttribute('position');
    for (const value of positions.array) assert.ok(Number.isFinite(value));
    vertices += positions.count;
  });
  assert.ok(vertices > 10000);
  assert.ok(world.batching.before > 500);
  assert.ok(world.batching.after < world.batching.before / 5);
  assert.equal(world.avatar.position.z,67);
});
test('doors open on approach, remain open inside, and reset at the gate', () => {
  const {world} = makeWorld();
  for (let frame=0;frame<60;frame++) world.updateDoors(1/30,{x:0,z:-28});
  assert.ok(world.doorOpen > .99);
  for (let frame=0;frame<60;frame++) world.updateDoors(1/30,{x:0,z:-39.4});
  assert.ok(world.doorOpen > .99);
  world.resetDoors(); assert.equal(world.doorOpen,0);
  for (let frame=0;frame<60;frame++) world.updateDoors(1/30,{x:0,z:67});
  assert.equal(world.doorOpen,0);
});
