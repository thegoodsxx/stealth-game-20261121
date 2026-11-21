/**
 * NIGHTWATCH: Silent Wing - Guard Entities & Patrol Logic
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
      radius: GUARD.radius,
      waypoints: route.waypoints,
      currentWaypointIndex: 0,
      pauseTimer: 0,
      isAlert: false,
      alertTimer: 0,
      lookSweepTime: 0,
      baseAngle: route.startAngle,
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
      g.baseAngle = g.angle;
      g.currentWaypointIndex = 0;
      g.pauseTimer = 0;
      g.isAlert = false;
      g.alertTimer = 0;
      g.lookSweepTime = 0;
    }
  }

  update(dt) {
    // Basic guard positioning update for M2
    for (const guard of this.guards) {
      if (guard.pauseTimer > 0) {
        guard.pauseTimer -= dt;
      }
    }
  }
}
