/**
 * NIGHTWATCH: Silent Wing - Vision Geometry & Detection Model
 */

import { GUARD, DETECTION } from './config.js';

export class VisionSystem {
  constructor() {
    this.detectionMeter = 0;
    this.isNearMissAlert = false;
    this.nearMissTimer = 0;
  }

  reset() {
    this.detectionMeter = 0;
    this.isNearMissAlert = false;
    this.nearMissTimer = 0;
  }

  update(dt, player, guards, level) {
    // Initial placeholder for M2; fully implemented in M3
    return {
      detectionMeter: this.detectionMeter,
      isAlert: this.isNearMissAlert,
      detectedByGuardId: null,
    };
  }

  calculateGuardCone(guard, segments) {
    // Basic placeholder cone for M2; raycasting implemented in M3
    const angle = guard.angle;
    const range = guard.isAlert ? GUARD.coneAlertRange : GUARD.coneRange;
    const fov = guard.isAlert ? GUARD.coneAlertFov : GUARD.coneFov;

    return {
      guard,
      points: [
        { x: guard.x, y: guard.y },
        { x: guard.x + Math.cos(angle - fov / 2) * range, y: guard.y + Math.sin(angle - fov / 2) * range },
        { x: guard.x + Math.cos(angle + fov / 2) * range, y: guard.y + Math.sin(angle + fov / 2) * range },
      ],
    };
  }
}
