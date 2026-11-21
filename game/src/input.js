/**
 * NIGHTWATCH: Silent Wing - Input Handler
 * Keyboard state management with support for WASD, Arrows, Shift (Sneak), P, Esc, R, Space, Enter.
 */

class InputHandler {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.hasInteracted = false;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onInteraction = this.onInteraction.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onInteraction);
    window.addEventListener('touchstart', this.onInteraction);
  }

  onInteraction() {
    this.hasInteracted = true;
  }

  onKeyDown(e) {
    this.hasInteracted = true;
    const code = e.code;

    // Prevent default scroll behaviors for navigation keys
    if (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'Space'
    ) {
      e.preventDefault();
    }

    if (!this.keys.has(code)) {
      this.justPressed.add(code);
    }
    this.keys.add(code);
  }

  onKeyUp(e) {
    this.keys.delete(e.code);
  }

  isDown(code) {
    return this.keys.has(code);
  }

  isJustPressed(code) {
    return this.justPressed.has(code);
  }

  isSneaking() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    return { dx, dy };
  }

  endFrame() {
    this.justPressed.clear();
  }

  reset() {
    this.keys.clear();
    this.justPressed.clear();
  }
}

export const input = new InputHandler();
