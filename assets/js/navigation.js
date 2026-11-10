/* Pure movement rules, shared by keyboard and touch input. */
(function (root) {
  'use strict';
  function heightAt(z,x = 0) {
    if (z > -21) return 0;
    if (z > -26) return (-21 - z) / 5 * 1.6;
    if (Math.abs(x) > 20) return 1.6;
    if (z > -27.5) return 1.6 + (-26 - z) / 1.5 * 0.6;
    return 2.2;
  }
  function canWalk(x, z, doorOpen) {
    if (!Number.isFinite(x) || !Number.isFinite(z) || z > 88 || z < -39.4) return false;
    if (Math.hypot(x+6,z+15)<2.6) return false;
    const ax = Math.abs(x);
    if (z < -21) {
      if (z >= -26) return ax <= 5.1;
      if (z >= -30.4) {
        // Door leaves swing into the porch. Leave clearance at both hinges.
        if (doorOpen > 0.3 && z < -27.7 && Math.abs(ax - 3.25) < 0.65) return false;
        return ax <= 28;
      }
      if (z >= -31.8) return doorOpen > 0.92 && ax <= 2.6;
      return ax <= 14.4 && !(Math.abs(ax - 8.6) < 1.1 && Math.abs(z + 35) < 1.1);
    }
    if (z >= 50 && z <= 53.8) return ax <= 3.1;
    return ax <= (z < 50 ? 26.4 : 54);
  }
  function move(position, dx, dz, doorOpen) {
    // Small substeps prevent tunnelling even after a delayed animation frame.
    let { x, z } = position;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.18));
    const sx = dx / steps, sz = dz / steps;
    for (let i = 0; i < steps; i++) {
      if (canWalk(x + sx, z + sz, doorOpen)) { x += sx; z += sz; }
      else {
        if (canWalk(x + sx, z, doorOpen)) x += sx;
        if (canWalk(x, z + sz, doorOpen)) z += sz;
      }
    }
    return { x, z };
  }
  const api = { heightAt, canWalk, move };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.Temple = root.Temple || {}).Navigation = api;
})(typeof window !== 'undefined' ? window : globalThis);
