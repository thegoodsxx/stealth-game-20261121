/**
 * NIGHTWATCH: Silent Wing - Configuration and Constants
 */

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

export const PALETTE = {
  // Facility environment
  background: '#070b12',
  floorBase: '#0d131d',
  floorGrid: '#141c2b',
  floorAccent: '#1a2436',
  wallFill: '#1a2332',
  wallBorder: '#2c3b52',
  wallHighlight: '#38bdf8',

  // Lighting
  lampWarm: 'rgba(255, 214, 138, ',
  lampCenter: '#fff2cc',

  // Player (Teal)
  playerBody: '#0f766e',
  playerCore: '#14b8a6',
  playerRing: '#2dd4bf',
  playerVisor: '#5eead4',
  playerAura: 'rgba(45, 212, 191, 0.25)',

  // Guards (Amber / Alert Red)
  guardBody: '#b45309',
  guardCore: '#f59e0b',
  guardRing: '#fbbf24',
  guardVisor: '#fef3c7',
  guardAlertBody: '#b91c1c',
  guardAlertCore: '#ef4444',
  guardAlertRing: '#f87171',
  guardAlertVisor: '#fee2e2',

  // Vision cones
  coneNormalInner: 'rgba(245, 158, 11, 0.42)',
  coneNormalOuter: 'rgba(245, 158, 11, 0.04)',
  coneAlertInner: 'rgba(239, 68, 68, 0.55)',
  coneAlertOuter: 'rgba(239, 68, 68, 0.08)',

  // Cover objects
  crateBase: '#382618',
  crateTrim: '#543924',
  shelfBase: '#1e2838',
  shelfDivider: '#334155',
  pillarFill: '#242e3d',
  pillarRim: '#3b495e',
  plantPot: '#33231a',
  plantLeaf: '#166534',
  plantLeafLight: '#22c55e',

  // Intel & Objectives
  intelGlow: 'rgba(56, 189, 248, 0.35)',
  intelFill: '#38bdf8',
  vaultGlow: 'rgba(16, 185, 129, 0.45)',
  vaultDoor: '#10b981',
  vaultWarning: '#34d399',

  // UI & HUD
  hudBg: 'rgba(9, 14, 23, 0.88)',
  hudBorder: '#1e293b',
  textMuted: '#64748b',
  textLight: '#e2e8f0',
  textHighlight: '#38bdf8',
  meterBack: '#1e293b',
  meterSafe: '#10b981',
  meterWarning: '#f59e0b',
  meterDanger: '#ef4444',
};

// Player settings
export const PLAYER = {
  radius: 13,
  speedWalk: 170,
  speedSneak: 85,
  footstepIntervalWalk: 0.38,
  footstepIntervalSneak: 0.65,
  footprintLifetime: 0.85,
};

// Guard settings
export const GUARD = {
  radius: 14,
  speedPatrol: 65,
  speedAlert: 105,
  coneRange: 215,
  coneFov: 72 * (Math.PI / 180), // 72 degrees in radians
  coneAlertRange: 245,
  coneAlertFov: 84 * (Math.PI / 180),
  coneRays: 120, // number of cast rays for smooth occlusion
  pauseLookSweepAngle: 35 * (Math.PI / 180),
  pauseLookSweepSpeed: 2.2,
  alertLookSweepSpeed: 4.5,
};

// Detection model settings
export const DETECTION = {
  max: 1.0,
  baseFillRate: 0.50, // balanced base rate
  closeDistanceFactor: 1.8, // quadratic proximity scaling for tight tension
  sneakMultiplier: 0.32, // sneaking significantly reduces detection build-up
  lampLightMultiplier: 1.80, // standing in lamp pool accelerates detection
  movingMultiplier: 1.25, // moving fast increases profile
  stillMultiplier: 0.80, // standing still decreases profile
  decayRate: 0.42, // fair recovery rate per second when hidden
  alertTriggerThreshold: 0.48, // near-miss alarm triggers at 48% meter
  alertCooldownTime: 4.2, // seconds guards remain in heightened alert
};

// Game screens
export const SCREEN = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  CAUGHT: 'CAUGHT',
  WON: 'WON',
};
