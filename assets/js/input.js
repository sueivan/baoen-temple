(function (root) {
  'use strict';
  class Input {
    constructor(scene, options) {
      this.options = options; this.keys = new Set(); this.pointer = null; this.x = this.z = 0;
      this.joystick = document.getElementById('joystick');
      this.pad = document.getElementById('move-pad');
      this.knob = this.pad.querySelector('.pad-knob');
      for (const element of [scene, this.pad]) {
        element.addEventListener('pointerdown', e => {
          if (!options.active() || this.pointer || e.button !== 0) return;
          e.preventDefault();
          const bounds = element.getBoundingClientRect(), appBounds = scene.getBoundingClientRect();
          const fixed = element === this.pad;
          const x = fixed ? bounds.left + bounds.width / 2 : e.clientX;
          const y = fixed ? bounds.top + bounds.height / 2 : e.clientY;
          this.pointer = { id:e.pointerId, x, y, element, fixed };
          element.setPointerCapture(e.pointerId);
          if (!fixed) {
            this.joystick.style.left = (x - appBounds.left) + 'px';
            this.joystick.style.top = (y - appBounds.top) + 'px';
            this.joystick.style.display = 'block';
          }
          this.update(e);
        });
        element.addEventListener('pointermove', e => this.update(e));
        for (const event of ['pointerup','pointercancel','lostpointercapture']) {
          element.addEventListener(event, e => { if (this.pointer && this.pointer.id === e.pointerId) this.clearPointer(); });
        }
      }
      root.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || !options.active()) return;
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable) return;
        const key = e.key.toLowerCase();
        if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) { e.preventDefault(); this.keys.add(key); }
        else if (!e.repeat && /^[1-4]$/.test(key)) { e.preventDefault(); options.action(['palm','bow','wood','beads'][Number(key)-1]); }
        else if (key === 'r' && !e.repeat) { e.preventDefault(); options.home(); }
      });
      root.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
      root.addEventListener('blur', () => this.reset());
    }
    update(e) {
      const pointer = this.pointer;
      if (!pointer || pointer.id !== e.pointerId) return;
      const dx = e.clientX - pointer.x, dz = e.clientY - pointer.y;
      const radius = pointer.fixed ? 38 : 60;
      const length = Math.hypot(dx,dz), scale = Math.min(length,radius) / Math.max(length,1);
      this.x = dx * scale / radius; this.z = dz * scale / radius;
      const transform = `translate(${this.x*26}px,${this.z*26}px)`;
      this.knob.style.transform = transform;
      this.joystick.firstElementChild.style.transform = transform;
    }
    read() {
      const k = this.keys;
      return {
        x: this.x + Number(k.has('d') || k.has('arrowright')) - Number(k.has('a') || k.has('arrowleft')),
        z: this.z + Number(k.has('s') || k.has('arrowdown')) - Number(k.has('w') || k.has('arrowup'))
      };
    }
    clearPointer() {
      const p = this.pointer; this.pointer = null; this.x = this.z = 0;
      this.joystick.style.display = 'none'; this.knob.style.transform = '';
      if (p && p.element.hasPointerCapture(p.id)) p.element.releasePointerCapture(p.id);
    }
    reset() { this.keys.clear(); this.clearPointer(); }
  }
  root.Temple.Input = Input;
})(window);
