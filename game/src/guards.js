/**
 * NIGHTWATCH: Silent Wing - Guard Entities & Patrol AI
 * Waypoint navigation, look-around sweeps at pauses, alert states, and smooth rotation.
 */

import { GUARD } from './config.js';

export class GuardManager {
  constructor(routes) {
    this.guards = routes.map((route) => ({
      id: route.id,
      name: route.name,
      x: route.startX,
      y: route.startY,
      angle: route.startAngle,
      targetAngle: route.startAngle,
      radius: GUARD.radius,
      waypoints: route.waypoints,
      currentWaypointIndex: 0,
      pauseTimer: route.waypoints[0]?.pauseTime ?? 0,
      isAlert: false,
      alertTimer: 0,
      lookSweepTime: 0,
      baseAngle: route.startAngle,
      footstepTimer: Math.random() * 0.4,
    }));
  }

  getGuards() {
    return this.guards;
  }

  reset() {
    for (const g of this.guards) {
      const wp = g.waypoints[0];
      g.x = wp.x;
      g.y = wp.y;
      g.angle = wp.lookAngle ?? 0;
      g.targetAngle = g.angle;
      g.baseAngle = g.angle;
      g.currentWaypointIndex = 0;
      g.pauseTimer = wp.pauseTime ?? 0;
      g.isAlert = false;
      g.alertTimer = 0;
      g.lookSweepTime = 0;
      g.footstepTimer = 0;
    }
  }

  triggerAlert(duration) {
    for (const g of this.guards) {
      g.isAlert = true;
      g.alertTimer = duration;
    }
  }

  update(dt, onGuardStep) {
    for (const guard of this.guards) {
      // 1. Alert timer countdown
      if (guard.isAlert) {
        guard.alertTimer -= dt;
        if (guard.alertTimer <= 0) {
          guard.isAlert = false;
          guard.alertTimer = 0;
        }
      }

      const wp = guard.waypoints[guard.currentWaypointIndex];

      // 2. Waypoint pause & look-around behavior
      if (guard.pauseTimer > 0) {
        guard.pauseTimer -= dt;
        guard.lookSweepTime += dt;

        // Sweep cone back and forth while paused to simulate scanning
        const sweepSpeed = guard.isAlert ? GUARD.pauseLookSweepSpeed * 1.5 : GUARD.pauseLookSweepSpeed;
        const sweepAngle = guard.isAlert ? GUARD.pauseLookSweepAngle * 1.3 : GUARD.pauseLookSweepAngle;
        const sweepOffset = Math.sin(guard.lookSweepTime * sweepSpeed) * sweepAngle;

        guard.targetAngle = (guard.baseAngle ?? 0) + sweepOffset;
        this.rotateTowardTarget(guard, dt, 5.0);

        if (guard.pauseTimer <= 0) {
          // Pause complete, proceed to next waypoint
          guard.currentWaypointIndex = (guard.currentWaypointIndex + 1) % guard.waypoints.length;
          guard.lookSweepTime = 0;
        }
        continue;
      }

      // 3. Movement toward next waypoint
      const dx = wp.x - guard.x;
      const dy = wp.y - guard.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        // Reached destination waypoint
        guard.x = wp.x;
        guard.y = wp.y;

        if (wp.pauseTime && wp.pauseTime > 0) {
          guard.pauseTimer = guard.isAlert ? wp.pauseTime * 0.6 : wp.pauseTime;
          guard.baseAngle = wp.lookAngle ?? guard.angle;
          guard.lookSweepTime = 0;
        } else {
          guard.currentWaypointIndex = (guard.currentWaypointIndex + 1) % guard.waypoints.length;
        }
      } else {
        // Walk toward waypoint
        const speed = guard.isAlert ? GUARD.speedAlert : GUARD.speedPatrol;
        const moveDist = Math.min(speed * dt, dist);

        guard.targetAngle = Math.atan2(dy, dx);
        this.rotateTowardTarget(guard, dt, 6.0);

        // Move along guard angle
        guard.x += Math.cos(guard.angle) * moveDist;
        guard.y += Math.sin(guard.angle) * moveDist;

        // Footstep timing
        guard.footstepTimer += dt;
        const stepInterval = guard.isAlert ? 0.32 : 0.48;
        if (guard.footstepTimer >= stepInterval) {
          guard.footstepTimer = 0;
          if (onGuardStep) {
            onGuardStep(guard);
          }
        }
      }
    }
  }

  /**
   * Smoothly rotates guard towards target angle via shortest angular path
   */
  rotateTowardTarget(guard, dt, turnSpeed) {
    let diff = guard.targetAngle - guard.angle;
    // Normalize diff to [-PI, PI]
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const maxTurn = turnSpeed * dt;
    if (Math.abs(diff) <= maxTurn) {
      guard.angle = guard.targetAngle;
    } else {
      guard.angle += Math.sign(diff) * maxTurn;
    }
  }
}
