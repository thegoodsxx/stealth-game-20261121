/**
 * NIGHTWATCH: Silent Wing - Audio System (Synthesized WebAudio)
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  playFootstep(isSneaking) {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  playGuardFootstep(distance) {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  playAlarmBlip() {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  updateDetectionSting(meter) {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  playFolderCollect() {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  playVictory() {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }

  playCaught() {
    if (!this.initialized || !this.ctx) return;
    // Implemented in M4
  }
}

export const sound = new SoundSystem();
