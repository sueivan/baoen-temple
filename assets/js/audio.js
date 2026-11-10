(function (root) {
  'use strict';
  class TempleAudio {
    constructor() { this.context = null; this.master = null; this.enabled = false; this.ambient = null; }
    async enable(enabled) {
      const generation = this.generation = (this.generation || 0) + 1;
      if (!enabled) {
        this.enabled = false;
        this.setAmbient(false);
        if (this.master) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.04);
        return;
      }
      if (!this.context) {
        const AudioContext = root.AudioContext || root.webkitAudioContext;
        if (!AudioContext) throw new Error('Audio unavailable');
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') await this.context.resume();
      if (generation !== this.generation) return;
      if (this.context.state !== 'running') throw new Error('Audio is suspended');
      this.enabled = true;
      this.master.gain.setTargetAtTime(0.5, this.context.currentTime, 0.06);
    }
    tone(start, end, duration, type, volume) {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator(), gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain); gain.connect(this.master);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(now); oscillator.stop(now + duration + 0.02);
    }
    wood() { this.tone(680, 280, 0.18, 'sine', 0.35); this.tone(1200, 720, 0.055, 'triangle', 0.05); }
    bell() { this.tone(660, 651, 1.8, 'sine', 0.22); this.tone(990, 980, 1.25, 'sine', 0.06); }
    bead() { this.tone(1500, 950, 0.045, 'sine', 0.04); }
    setAmbient(enabled) {
      if (enabled && this.enabled && this.context && !this.ambient) {
        const gain = this.context.createGain();
        gain.gain.value = 0.0001; gain.connect(this.master);
        gain.gain.setTargetAtTime(0.018, this.context.currentTime, 0.8);
        const nodes = [110, 165, 220.3].map(frequency => {
          const o = this.context.createOscillator(); o.frequency.value = frequency;
          o.connect(gain); o.start(); return o;
        });
        this.ambient = { nodes, gain };
      } else if (!enabled && this.ambient) {
        const { nodes, gain } = this.ambient; this.ambient = null;
        const end = this.context.currentTime + 0.2;
        gain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.04);
        for (const node of nodes) node.stop(end);
        nodes[0].onended = () => { for (const node of nodes) node.disconnect(); gain.disconnect(); };
      }
    }
    async pause() {
      if (this.context && this.context.state === 'running') {
        try { await this.context.suspend(); } catch (_) { /* Graphics still work without audio. */ }
      }
    }
  }
  root.Temple.Audio = TempleAudio;
})(window);
