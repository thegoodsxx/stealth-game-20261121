/**
 * NIGHTWATCH: Silent Wing - World & Level Data
 * Hand-crafted level layout, walls, cover objects, lamps, intel folders, and collision geometry.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER, GUARD } from './config.js';

// Outer level boundaries (within 1280x800, top margin for HUD)
export const PLAYFIELD = {
  minX: 20,
  minY: 50,
  maxX: 1260,
  maxY: 780,
  width: 1240,
  height: 730,
};

export function createLevel() {
  // 1. Structural Walls (block movement and vision)
  const walls = [
    // Outer perimeter walls
    { x: 20, y: 50, w: 10, h: 730, name: 'west-outer' },
    { x: 20, y: 50, w: 1240, h: 10, name: 'north-outer' },
    { x: 20, y: 770, w: 1240, h: 10, name: 'south-outer' },
    { x: 1250, y: 50, w: 10, h: 730, name: 'east-outer' },

    // West Archive Room (x: 20..400, y: 50..450)
    // East wall of West Archive (doorway at y: 210..290)
    { x: 400, y: 50, w: 10, h: 160, name: 'archive-east-top' },
    { x: 400, y: 290, w: 10, h: 160, name: 'archive-east-bot' },
    // South wall of West Archive (doorway at x: 140..220)
    { x: 20, y: 440, w: 120, h: 10, name: 'archive-south-left' },
    { x: 220, y: 440, w: 180, h: 10, name: 'archive-south-right' },

    // West Staging dividing wall to South Gallery (doorway at y: 580..660)
    { x: 380, y: 450, w: 10, h: 130, name: 'staging-east-top' },
    { x: 380, y: 660, w: 10, h: 110, name: 'staging-east-bot' },

    // Central Atrium to South Gallery wall (doorway at x: 600..700)
    { x: 400, y: 480, w: 200, h: 10, name: 'atrium-south-left' },
    { x: 700, y: 480, w: 180, h: 10, name: 'atrium-south-right' },

    // Central Atrium to Vault Corridor wall (doorway at y: 170..260)
    { x: 880, y: 50, w: 10, h: 120, name: 'atrium-east-top' },
    { x: 880, y: 260, w: 10, h: 220, name: 'atrium-east-bot' },

    // South Gallery to East Office wall (doorway at y: 600..680)
    { x: 920, y: 480, w: 10, h: 120, name: 'gallery-east-top' },
    { x: 920, y: 680, w: 10, h: 90, name: 'gallery-east-bot' },

    // Vault Corridor to East Office horizontal dividing wall (doorway at x: 1080..1160)
    { x: 880, y: 460, w: 200, h: 10, name: 'vault-south-left' },
    { x: 1160, y: 460, w: 90, h: 10, name: 'vault-south-right' },
  ];

  // 2. Cover Objects (Shelves, Crates, Desks, Pillars, Plants)
  // All block vision and movement!
  const cover = [
    // West Archive - Tall Bookshelves / Record Stacks
    { kind: 'shelf', x: 90, y: 120, w: 28, h: 220, label: 'ARCHIVE-01' },
    { kind: 'shelf', x: 190, y: 110, w: 28, h: 220, label: 'ARCHIVE-02' },
    { kind: 'shelf', x: 290, y: 120, w: 28, h: 220, label: 'ARCHIVE-03' },

    // Central Security Atrium - Center Desk & Pillars
    { kind: 'desk', x: 590, y: 220, w: 100, h: 60, label: 'TERMINAL' },
    { kind: 'pillar', x: 510, y: 150, radius: 18 },
    { kind: 'pillar', x: 770, y: 150, radius: 18 },
    { kind: 'pillar', x: 510, y: 370, radius: 18 },
    { kind: 'pillar', x: 770, y: 370, radius: 18 },

    // Central Atrium & Corridors - Decorative Plants
    { kind: 'plant', x: 440, y: 90, radius: 16 },
    { kind: 'plant', x: 840, y: 90, radius: 16 },
    { kind: 'plant', x: 420, y: 740, radius: 16 },
    { kind: 'plant', x: 960, y: 740, radius: 16 },

    // South Gallery - Storage Crates
    { kind: 'crate', x: 460, y: 550, w: 60, h: 50 },
    { kind: 'crate', x: 570, y: 640, w: 70, h: 60 },
    { kind: 'crate', x: 720, y: 540, w: 60, h: 70 },
    { kind: 'crate', x: 800, y: 660, w: 50, h: 50 },
    { kind: 'crate', x: 60, y: 520, w: 50, h: 50 },

    // Vault Sector - Security Pillars & Barricade
    { kind: 'pillar', x: 980, y: 210, radius: 18 },
    { kind: 'pillar', x: 1100, y: 210, radius: 18 },
    { kind: 'crate', x: 1020, y: 310, w: 60, h: 40 },

    // East Office - Secure Filing Cabinets & Safe
    { kind: 'shelf', x: 1020, y: 530, w: 28, h: 120, label: 'SECURE-04' },
    { kind: 'desk', x: 1160, y: 530, w: 60, h: 45, label: 'SAFE' },
  ];

  // 3. Warm Lamp Light Pools (Standing in light increases detection rate!)
  const lamps = [
    { x: 235, y: 105, radius: 95, label: 'Archive Lamp' },
    { x: 640, y: 250, radius: 125, label: 'Atrium Center Light' },
    { x: 640, y: 110, radius: 80, label: 'Atrium North Light' },
    { x: 490, y: 660, radius: 90, label: 'Gallery Light A' },
    { x: 750, y: 660, radius: 90, label: 'Gallery Light B' },
    { x: 1040, y: 210, radius: 100, label: 'Vault Corridor Light' },
    { x: 1140, y: 630, radius: 85, label: 'Office Lamp' },
  ];

  // 4. Intel Folders (3 classified dossiers to collect)
  const intelFolders = [
    { id: 1, x: 345, y: 75, radius: 12, name: 'WEST ARCHIVE BLUEPRINTS', collected: false },
    { id: 2, x: 640, y: 250, radius: 12, name: 'SECURITY CYPHER KEYS', collected: false },
    { id: 3, x: 1200, y: 720, radius: 12, name: 'VAULT OVERRIDE SCHEMATICS', collected: false },
  ];

  // 5. Exit Vault Door
  const vaultExit = {
    doorX: 1240,
    doorY: 170,
    doorW: 15,
    doorH: 90,
    // Trigger zone the player steps into to win
    trigger: { x: 1190, y: 170, w: 55, h: 90 },
  };

  // 6. Player Initial State
  const player = {
    x: 80,
    y: 680,
    radius: PLAYER.radius,
    angle: -Math.PI / 2, // facing north initially
    isSneaking: false,
    speed: 0,
    footstepTimer: 0,
  };

  // 7. Guard Patrol Routes & Definitions
  const guardRoutes = [
    // Guard 1: Archive Sentry (weaves through book aisles)
    {
      id: 1,
      name: 'Sentry Alpha',
      startX: 55,
      startY: 90,
      startAngle: Math.PI / 2,
      waypoints: [
        { x: 55, y: 90, pauseTime: 1.8, lookAngle: Math.PI / 2 },
        { x: 55, y: 390, pauseTime: 0.5, lookAngle: 0 },
        { x: 145, y: 390, pauseTime: 0.5, lookAngle: -Math.PI / 2 },
        { x: 145, y: 90, pauseTime: 1.8, lookAngle: -Math.PI / 2 },
        { x: 245, y: 90, pauseTime: 0.5, lookAngle: Math.PI / 2 },
        { x: 245, y: 390, pauseTime: 0.5, lookAngle: 0 },
        { x: 345, y: 390, pauseTime: 0.5, lookAngle: -Math.PI / 2 },
        { x: 345, y: 90, pauseTime: 2.0, lookAngle: Math.PI },
        { x: 245, y: 90, pauseTime: 0.5, lookAngle: Math.PI },
      ],
    },
    // Guard 2: Atrium Sweeper (circles central security checkpoint)
    {
      id: 2,
      name: 'Sentry Beta',
      startX: 480,
      startY: 110,
      startAngle: 0,
      waypoints: [
        { x: 480, y: 110, pauseTime: 1.6, lookAngle: 0 },
        { x: 810, y: 110, pauseTime: 1.8, lookAngle: Math.PI / 2 },
        { x: 810, y: 410, pauseTime: 1.6, lookAngle: Math.PI },
        { x: 480, y: 410, pauseTime: 1.8, lookAngle: -Math.PI / 2 },
      ],
    },
    // Guard 3: Logistics Patrol (patrols between crate rows)
    {
      id: 3,
      name: 'Sentry Gamma',
      startX: 410,
      startY: 710,
      startAngle: 0,
      waypoints: [
        { x: 410, y: 710, pauseTime: 1.5, lookAngle: -Math.PI },
        { x: 650, y: 710, pauseTime: 0.6, lookAngle: -Math.PI / 2 },
        { x: 870, y: 710, pauseTime: 1.8, lookAngle: 0 },
        { x: 870, y: 530, pauseTime: 1.2, lookAngle: -Math.PI / 2 },
        { x: 640, y: 530, pauseTime: 0.6, lookAngle: Math.PI },
        { x: 410, y: 530, pauseTime: 1.4, lookAngle: Math.PI / 2 },
      ],
    },
    // Guard 4: Vault Warden (sweeps the final vault approach)
    {
      id: 4,
      name: 'Sentry Delta',
      startX: 940,
      startY: 130,
      startAngle: 0,
      waypoints: [
        { x: 940, y: 130, pauseTime: 1.5, lookAngle: 0 },
        { x: 1170, y: 130, pauseTime: 2.2, lookAngle: Math.PI / 4 },
        { x: 1170, y: 350, pauseTime: 2.0, lookAngle: 0 },
        { x: 940, y: 350, pauseTime: 1.6, lookAngle: -Math.PI / 2 },
      ],
    },
  ];

  // 8. Compile Occlusion Segments for Fast Raycasting
  // We extract all boundary segments from walls and rectangular cover,
  // plus multi-segment circular approximations for pillars and plants.
  const segments = compileOcclusionSegments(walls, cover);

  return {
    walls,
    cover,
    lamps,
    intelFolders,
    vaultExit,
    player,
    guardRoutes,
    segments,
  };
}

/**
 * Compiles all obstacle geometries into line segments for vision raycasting
 */
function compileOcclusionSegments(walls, cover) {
  const segments = [];

  // Helper to add a rectangle's 4 sides
  function addBox(x, y, w, h) {
    segments.push({ x1: x, y1: y, x2: x + w, y2: y });
    segments.push({ x1: x + w, y1: y, x2: x + w, y2: y + h });
    segments.push({ x1: x + w, y1: y + h, x2: x, y2: y + h });
    segments.push({ x1: x, y1: y + h, x2: x, y2: y });
  }

  // Helper to add a circle approximation (8-segment octagonal approximation for crisp shadows)
  function addCircle(cx, cy, r) {
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const a1 = (i / sides) * Math.PI * 2;
      const a2 = ((i + 1) / sides) * Math.PI * 2;
      segments.push({
        x1: cx + Math.cos(a1) * r,
        y1: cy + Math.sin(a1) * r,
        x2: cx + Math.cos(a2) * r,
        y2: cy + Math.sin(a2) * r,
      });
    }
  }

  // Add walls
  for (const w of walls) {
    addBox(w.x, w.y, w.w, w.h);
  }

  // Add cover
  for (const c of cover) {
    if (c.kind === 'pillar' || c.kind === 'plant') {
      addCircle(c.x, c.y, c.radius);
    } else {
      addBox(c.x, c.y, c.w, c.h);
    }
  }

  return segments;
}

/**
 * Checks if a circle (player) overlaps with any wall or cover object
 */
export function checkCollision(x, y, radius, level) {
  // Check outer boundaries
  if (
    x - radius < PLAYFIELD.minX + 10 ||
    x + radius > PLAYFIELD.maxX - 10 ||
    y - radius < PLAYFIELD.minY + 10 ||
    y + radius > PLAYFIELD.maxY - 10
  ) {
    return true;
  }

  // Check walls
  for (const w of level.walls) {
    if (circleBoxOverlap(x, y, radius, w.x, w.y, w.w, w.h)) {
      return true;
    }
  }

  // Check cover objects
  for (const c of level.cover) {
    if (c.kind === 'pillar' || c.kind === 'plant') {
      const dist = Math.hypot(x - c.x, y - c.y);
      if (dist < radius + c.radius) return true;
    } else {
      if (circleBoxOverlap(x, y, radius, c.x, c.y, c.w, c.h)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Tests overlap between a circle and an axis-aligned bounding box
 */
function circleBoxOverlap(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const distX = cx - closestX;
  const distY = cy - closestY;
  return distX * distX + distY * distY < radius * radius;
}

/**
 * Updates player position with sliding collision resolution along walls
 */
export function movePlayer(player, dx, dy, dt, level) {
  const speed = player.isSneaking ? PLAYER.speedSneak : PLAYER.speedWalk;
  const moveDist = speed * dt;

  if (dx === 0 && dy === 0) {
    player.speed = 0;
    return;
  }

  player.speed = speed;
  player.angle = Math.atan2(dy, dx);

  const targetX = player.x + dx * moveDist;
  const targetY = player.y + dy * moveDist;

  // Try moving on X axis first
  if (!checkCollision(targetX, player.y, player.radius, level)) {
    player.x = targetX;
  }
  // Try moving on Y axis
  if (!checkCollision(player.x, targetY, player.radius, level)) {
    player.y = targetY;
  }
}

/**
 * Checks if the player is currently standing inside any lamp's warm light pool
 */
export function isPlayerInLampLight(player, level) {
  for (const lamp of level.lamps) {
    const dist = Math.hypot(player.x - lamp.x, player.y - lamp.y);
    if (dist < lamp.radius) {
      return true;
    }
  }
  return false;
}
