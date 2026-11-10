/* Keep the complete statue within the screen area left clear by phone controls. */
(function (root) {
  'use strict';
  function corners(THREE,bounds) {
    const points = [];
    for (const x of [bounds.min.x,bounds.max.x]) {
      for (const y of [bounds.min.y,bounds.max.y]) {
        for (const z of [bounds.min.z,bounds.max.z]) points.push(new THREE.Vector3(x,y,z));
      }
    }
    return points;
  }
  function fit(THREE,bounds,aspect,safe) {
    const points = corners(THREE,bounds);
    const target = bounds.getCenter(new THREE.Vector3());
    // Remain inside the door lintel and ahead of the hall columns.
    const position = new THREE.Vector3(0,6.4,-32.4);
    const camera = new THREE.PerspectiveCamera(65,aspect,.1,700);
    camera.position.copy(position); camera.lookAt(target); camera.updateMatrixWorld(true);
    let offsetY = 0;
    function fits(fov) {
      camera.fov = fov; camera.clearViewOffset(); camera.updateProjectionMatrix();
      const box = {minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity};
      for (const point of points) {
        const p = point.clone().project(camera);
        box.minX = Math.min(box.minX,p.x); box.maxX = Math.max(box.maxX,p.x);
        box.minY = Math.min(box.minY,p.y); box.maxY = Math.max(box.maxY,p.y);
      }
      const shift = 1-safe.top-safe.bottom-(box.minY+box.maxY)/2;
      offsetY = shift/2;
      return box.minX >= safe.left*2-1 && box.maxX <= safe.right*2-1 &&
        box.minY+shift >= 1-safe.bottom*2 && box.maxY+shift <= 1-safe.top*2;
    }
    let low = 40, high = 135;
    for (let i=0;i<22;i++) {
      const middle = (low+high)/2;
      if (fits(middle)) high = middle;
      else low = middle;
    }
    const fov = Math.min(135,high+1);
    fits(fov);
    return {position,target,fov,offsetY};
  }
  const api = {corners,fit};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.Temple = root.Temple || {}).HallCamera = api;
})(typeof window !== 'undefined' ? window : globalThis);
