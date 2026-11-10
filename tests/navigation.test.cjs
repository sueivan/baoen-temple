const test = require('node:test');
const assert = require('node:assert/strict');
const nav = require('../assets/js/navigation.js');

test('mountain gate and courtyard walls cannot be crossed', () => {
  assert.equal(nav.canWalk(0, 52, 0), true);
  assert.equal(nav.canWalk(6, 52, 0), false);
  assert.equal(nav.canWalk(28, 10, 0), false);
});
test('stairs are the only way to the upper terrace', () => {
  assert.equal(nav.canWalk(0, -23, 0), true);
  assert.equal(nav.canWalk(10, -23, 0), false);
  assert.equal(nav.heightAt(-20), 0);
  assert.ok(nav.heightAt(-24) > 0 && nav.heightAt(-24) < 1.6);
  assert.equal(nav.heightAt(-28), 2.2);
  assert.equal(nav.heightAt(-28,24),1.6);
});
test('hall threshold requires an open door and blocks the front walls', () => {
  assert.equal(nav.canWalk(0, -31, 0.4), false);
  assert.equal(nav.canWalk(0, -31, 1), true);
  assert.equal(nav.canWalk(5, -31, 1), false);
  assert.equal(nav.canWalk(8.6, -35, 1), false);
  assert.equal(nav.canWalk(0, -42, 1), false);
});
test('large movement deltas cannot tunnel through a wall or a closed door', () => {
  const gate = nav.move({ x: 6, z: 58 }, 0, -12, 1);
  assert.ok(gate.z > 53.8);
  const door = nav.move({ x: 0, z: -29 }, 0, -8, 0);
  assert.ok(door.z >= -30.4);
});
test('a diagonal collision still lets the visitor slide along the wall', () => {
  const pos = nav.move({ x: 26, z: 15 }, 3, -3, 0);
  assert.ok(pos.x <= 26.4);
  assert.ok(pos.z < 15);
});
