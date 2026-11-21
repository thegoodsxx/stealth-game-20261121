/**
 * NIGHTWATCH: Silent Wing - Vision Geometry & Detection Model
 * Raycasting vision cones occluded by walls & cover, line-of-sight checks, and detection rates.
 */

import { GUARD, DETECTION } from './config.js';
import { isPlayerInLampLight } from './world.js';

export class VisionSystem {
  constructor() {
    this.detectionMeter = 0;
    this.isNearMissAlert = false;
    this.alertCooldownTimer = 0;
  }

  reset() {
    this.detectionMeter = 0;
    this.isNearMissAlert = false;
    this.alertCooldownTimer = 0;
  }

  /**
   * Casts dense rays for a guard's vision cone and clips against all level obstacles
   */
  calculateGuardCone(guard, segments) {
    const angle = guard.angle;
    const isAlert = guard.isAlert;
    const range = isAlert ? GUARD.coneAlertRange : GUARD.coneRange;
    const fov = isAlert ? GUARD.coneAlertFov : GUARD.coneFov;
    const numRays = GUARD.coneRays;

    const points = [{ x: guard.x, y: guard.y }];
    const startAngle = angle - fov / 2;
    const angleStep = fov / (numRays - 1);

    for (let i = 0; i < numRays; i++) {
      const rayAngle = startAngle + i * angleStep;
      const rayDirX = Math.cos(rayAngle);
      const rayDirY = Math.sin(rayAngle);

      let minT = 1.0; // Normalized distance [0, 1] along ray

      const x1 = guard.x;
      const y1 = guard.y;
      const x2 = guard.x + rayDirX * range;
      const y2 = guard.y + rayDirY * range;

      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        const t = this.getSegmentIntersectionT(x1, y1, x2, y2, seg.x1, seg.y1, seg.x2, seg.y2);
        if (t !== null && t < minT) {
          minT = t;
        }
      }

      points.push({
        x: x1 + rayDirX * range * minT,
        y: y1 + rayDirY * range * minT,
      });
    }

    return {
      guard,
      points,
    };
  }

  /**
   * Calculates intersection parameter T along ray (x1, y1)->(x2, y2) with segment (x3, y3)->(x4, y4)
   */
  getSegmentIntersectionT(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 1e-6) return null;

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return ua;
    }
    return null;
  }

  /**
   * Checks if line of sight from (gx, gy) to (px, py) is blocked by any obstacle segment
   */
  hasLineOfSight(gx, gy, px, py, segments) {
    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s];
      const t = this.getSegmentIntersectionT(gx, gy, px, py, seg.x1, seg.y1, seg.x2, seg.y2);
      if (t !== null && t > 0.02 && t < 0.98) {
        return false; // Occluded by obstacle
      }
    }
    return true; // Clear line of sight
  }

  /**
   * Evaluates detection model for current frame
   */
  update(dt, player, guards, level, onAlertTrigger) {
    let maxDetectionRate = 0;
    let detectingGuard = null;
    const inLamp = isPlayerInLampLight(player, level);

    for (const guard of guards) {
      const dx = player.x - guard.x;
      const dy = player.y - guard.y;
      const dist = Math.hypot(dx, dy);
      const range = guard.isAlert ? GUARD.coneAlertRange : GUARD.coneRange;
      const fov = guard.isAlert ? GUARD.coneAlertFov : GUARD.coneFov;

      if (dist > range) continue;

      // Check angular field of view
      const angleToPlayer = Math.atan2(dy, dx);
      let angleDiff = angleToPlayer - guard.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      if (Math.abs(angleDiff) > fov / 2) continue;

      // Check occlusion by obstacles
      if (!this.hasLineOfSight(guard.x, guard.y, player.x, player.y, level.segments)) {
        continue;
      }

      // Player is visible! Calculate detection rate
      // 1. Proximity factor: quadratic curve so perimeter is survivable, close quarters perilous
      const proxNorm = Math.max(0, 1.0 - dist / range);
      const proxFactor = 1.0 + (proxNorm * proxNorm) * DETECTION.closeDistanceFactor;

      // 2. Sneak factor: sneaking drastically reduces signature
      const sneakFactor = player.isSneaking ? DETECTION.sneakMultiplier : 1.0;

      // 3. Movement factor: running is easier to spot
      const motionFactor = player.speed > 0
        ? (player.isSneaking ? 1.0 : DETECTION.movingMultiplier)
        : DETECTION.stillMultiplier;

      // 4. Lamp light pool factor: illuminated player is obvious
      const lightFactor = inLamp ? DETECTION.lampLightMultiplier : 1.0;

      const rate = DETECTION.baseFillRate * proxFactor * sneakFactor * motionFactor * lightFactor;

      if (rate > maxDetectionRate) {
        maxDetectionRate = rate;
        detectingGuard = guard;
      }
    }

    const wasAlert = this.isNearMissAlert;

    if (maxDetectionRate > 0) {
      // Detection meter fills up
      this.detectionMeter = Math.min(DETECTION.max, this.detectionMeter + maxDetectionRate * dt);

      // Check for near-miss alarm trigger
      if (this.detectionMeter >= DETECTION.alertTriggerThreshold) {
        if (!this.isNearMissAlert) {
          this.isNearMissAlert = true;
          this.alertCooldownTimer = DETECTION.alertCooldownTime;
          if (onAlertTrigger) {
            onAlertTrigger(this.alertCooldownTimer);
          }
        } else {
          // Refresh alert timer while detected
          this.alertCooldownTimer = DETECTION.alertCooldownTime;
        }
      }
    } else {
      // Player is hidden: detection meter gradually decays
      this.detectionMeter = Math.max(0, this.detectionMeter - DETECTION.decayRate * dt);

      // Cool down alarm state when player stays hidden
      if (this.isNearMissAlert) {
        this.alertCooldownTimer -= dt;
        if (this.alertCooldownTimer <= 0) {
          this.isNearMissAlert = false;
          this.alertCooldownTimer = 0;
        }
      }
    }

    const isCaught = this.detectionMeter >= DETECTION.max;

    return {
      detectionMeter: this.detectionMeter,
      isAlert: this.isNearMissAlert,
      isCaught,
      detectingGuard,
      newlyAlerted: !wasAlert && this.isNearMissAlert,
    };
  }
}
