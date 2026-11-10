const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const THREE = require('../assets/vendor/three.r128.min.js');
const framing = require('../assets/js/hall-camera.js');
function makeWorld() {
  const context = {createLinearGradient:() => ({addColorStop(){}})};
  for (const name of ['fillRect','strokeRect','beginPath','moveTo','lineTo','stroke','arc','fill','fillText']) context[name] = () => {};
  const scope = {THREE,window:{Temple:{}},document:{createElement:() => ({getContext:() => context})}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/world.js'),'utf8'),scope);
  const scene = new THREE.Scene(), world = scope.window.Temple.createWorld(scene);
  scene.updateMatrixWorld(true);
  return {scene,world};
}
function cameraFor(pose,aspect) {
  const camera = new THREE.PerspectiveCamera(pose.fov,aspect,.1,700);
  camera.position.copy(pose.position);camera.lookAt(pose.target);
  camera.setViewOffset(aspect,1,0,pose.offsetY,aspect,1);camera.updateMatrixWorld(true);
  return camera;
}
test('the entire Buddha and lotus fit above phone controls and below the header', () => {
  const {world} = makeWorld();
  for (const [width,height,top,bottom] of [[375,700,120,435],[390,844,120,579],[320,568,120,303],[430,932,155,633],[844,390,78,218],[667,320,78,148]]) {
    const safe = {left:.08,right:.92,top:top/height,bottom:bottom/height};
    const pose = framing.fit(THREE,world.buddhaBounds,width/height,safe);
    const camera = cameraFor(pose,width/height);
    assert.ok(pose.position.z < -31.8,'camera must be inside the lintel');
    for (const corner of framing.corners(THREE,world.buddhaBounds)) {
      const point = corner.project(camera), x = (point.x+1)/2, y = (1-point.y)/2;
      assert.ok(x >= safe.left-.001 && x <= safe.right+.001,`${width}x${height}: side clipped`);
      assert.ok(y >= safe.top-.001 && y <= safe.bottom+.001,`${width}x${height}: head or lotus behind UI`);
    }
  }
});
test('the lintel and hanging lamp no longer hide the face or crown from the hall camera', () => {
  const {scene,world} = makeWorld();
  const pose = framing.fit(THREE,world.buddhaBounds,375/700,{left:.08,right:.92,top:.18,bottom:.62});
  for (const coords of [[0,8.3,-42.8],[0,9.48,-43.7],[-.4,8.5,-42.9],[.4,8.5,-42.9]]) {
    const target = new THREE.Vector3(...coords), delta = target.clone().sub(pose.position), distance = delta.length();
    const hits = new THREE.Raycaster(pose.position,delta.normalize(),.01,distance-.12).intersectObjects(scene.children,true);
    const blockers = hits.filter(hit => [0xdfe9ff,0xaaaaaa,0x3d2418,0x773c2c].includes(hit.object.material.color.getHex()));
    assert.equal(blockers.length,0,`face/crown obstructed at ${coords}`);
  }
});
