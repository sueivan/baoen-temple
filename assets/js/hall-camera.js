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
  function fit(THREE,bounds,aspect,safe,actorBounds) {
    const points = corners(THREE,bounds);
    if (actorBounds) points.push(...corners(THREE,actorBounds));
    const composition = bounds.clone();
    if (actorBounds) composition.union(actorBounds);
    const target = composition.getCenter(new THREE.Vector3());
    // Remain inside the door lintel and ahead of the hall columns.
    const position = new THREE.Vector3(actorBounds ? actorBounds.getCenter(new THREE.Vector3()).x*.45 : 0,actorBounds ? 4.8 : 6.4,actorBounds ? -31.6 : -32.4);
    if (actorBounds) {
      const directions = points.map(point => point.clone().sub(position));
      const yaws = directions.map(d => Math.atan2(d.x,-d.z));
      const pitches = directions.map(d => Math.atan2(d.y,Math.hypot(d.x,d.z)));
      const yaw = (Math.min(...yaws)+Math.max(...yaws))/2;
      const pitch = (Math.min(...pitches)+Math.max(...pitches))/2;
      target.copy(position).add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(10));
    }
    const camera = new THREE.PerspectiveCamera(65,aspect,.1,700);
    camera.position.copy(position); camera.lookAt(target); camera.updateMatrixWorld(true);
    let offsetY = 0, offsetX = 0;
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
      const shiftX = safe.left+safe.right-1-(box.minX+box.maxX)/2;
      offsetX = -shiftX/2;
      return box.minX+shiftX >= safe.left*2-1 && box.maxX+shiftX <= safe.right*2-1 &&
        box.minY+shift >= 1-safe.bottom*2 && box.maxY+shift <= 1-safe.top*2;
    }
    let low = 40, high = 145;
    for (let i=0;i<22;i++) {
      const middle = (low+high)/2;
      if (fits(middle)) high = middle;
      else low = middle;
    }
    const fov = Math.min(145,high+1);
    fits(fov);
    return {position,target,fov,offsetY,offsetX};
  }
  const api = {corners,fit};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.Temple = root.Temple || {}).HallCamera = api;
})(typeof window !== 'undefined' ? window : globalThis);
