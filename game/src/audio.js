/**
 * NIGHTWATCH: Silent Wing - Synthesized WebAudio System
 * Procedural sound effects using WebAudio API oscillators, noise buffers, and gain envelopes.
 * No external audio files or dependencies.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.initialized = false;

    // Detection sting persistent nodes
    this.stingOsc = null;
    this.stingGain = null;
    this.stingLfo = null;
    this.stingLfoGain = null;
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.initialized = true;

      // Setup continuous detection tension sting
      this.setupDetectionSting();
    } catch {
      // AudioContext unavailable
    }
  }

  setupDetectionSting() {
    if (!this.ctx) return;
    try {
      this.stingOsc = this.ctx.createOscillator();
      this.stingOsc.type = 'sawtooth';
      this.stingOsc.frequency.setValueAtTime(280, this.ctx.currentTime);

      // Lowpass filter to keep sting dark and cinematic
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      this.stingGain = this.ctx.createGain();
      this.stingGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Subtle frequency vibrato
      this.stingLfo = this.ctx.createOscillator();
      this.stingLfo.frequency.setValueAtTime(6, this.ctx.currentTime);
      this.stingLfoGain = this.ctx.createGain();
      this.stingLfoGain.gain.setValueAtTime(8, this.ctx.currentTime);

      this.stingLfo.connect(this.stingOsc.frequency);
      this.stingOsc.connect(filter);
      filter.connect(this.stingGain);
      this.stingGain.connect(this.ctx.destination);

      this.stingOsc.start();
      this.stingLfo.start();
    } catch {
      // Audio node setup failed
    }
  }

  /**
   * Updates detection sting volume and pitch based on detection meter [0, 1]
   */
  updateDetectionSting(meter) {
    if (!this.ctx || !this.stingGain || !this.stingOsc) return;

    const t = this.ctx.currentTime;
    if (meter > 0.08) {
      // Rising frequency from 280Hz up to 720Hz
      const targetFreq = 280 + meter * 440;
      const targetGain = Math.min(0.22, meter * 0.22);
      this.stingOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
      this.stingGain.gain.setTargetAtTime(targetGain, t, 0.08);
    } else {
      this.stingGain.gain.setTargetAtTime(0, t, 0.08);
    }
  }

  /**
   * Soft footstep ticks for player (quieter and lower pitch when sneaking)
   */
  playFootstep(isSneaking) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSneaking ? 300 : 650, t);

      osc.type = 'triangle';
      const startFreq = isSneaking ? 110 : 160;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.04);

      const maxGain = isSneaking ? 0.03 : 0.09;
      gain.gain.setValueAtTime(maxGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Guard heavy boot steps whose volume tracks distance to player
   */
  playGuardFootstep(distance) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    const maxDist = 550;
    if (distance >= maxDist) return;

    try {
      const t = this.ctx.currentTime;
      const distFactor = Math.max(0, 1 - distance / maxDist);
      const volume = distFactor * distFactor * 0.12;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.06);

      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Alarm blip when near-miss or heightened security triggers
   */
  playAlarmBlip() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(660, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Chime when collecting an Intel folder
   */
  playFolderCollect() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Victory exfiltration fanfare
   */
  playVictory() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      // Ascending triumphant chord
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Dramatic alert crash when caught
   */
  playCaught() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.4);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    } catch {
      // Audio playback failed
    }
  }
}

export const sound = new SoundSystem();
