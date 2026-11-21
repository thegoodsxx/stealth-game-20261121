/**
 * NIGHTWATCH: Silent Wing - Main Game Loop & State Machine
 */

import { SCREEN, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER } from './config.js';
import { input } from './input.js';
import { createLevel, movePlayer } from './world.js';
import { GuardManager } from './guards.js';
import { VisionSystem } from './vision.js';
import { sound } from './audio.js';
import { Renderer } from './render.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.level = createLevel();
    this.guardManager = new GuardManager(this.level.guardRoutes);
    this.visionSystem = new VisionSystem();

    this.screen = SCREEN.MENU;
    this.collectedIntel = [];
    this.missionTime = 0;
    this.wasEverAlerted = false;
    this.isAlert = false;
    this.detectionMeter = 0;
    this.visionCones = [];

    this.lastTime = performance.now();
    this.setupEventListeners();
    this.checkStagingHook();

    requestAnimationFrame(this.loop.bind(this));
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', () => {
      sound.init();
      if (this.screen === SCREEN.MENU) {
        this.screen = SCREEN.PLAYING;
      } else if (this.screen === SCREEN.CAUGHT || this.screen === SCREEN.WON) {
        this.restart();
      }
    });

    window.addEventListener('keydown', () => {
      sound.init();
    });
  }

  restart() {
    this.level = createLevel();
    this.guardManager.reset();
    this.visionSystem.reset();
    this.collectedIntel = [];
    this.missionTime = 0;
    this.wasEverAlerted = false;
    this.isAlert = false;
    this.detectionMeter = 0;
    this.visionCones = [];
    this.screen = SCREEN.PLAYING;
  }

  checkStagingHook() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (!shot) return;

    this.screen = SCREEN.PLAYING;

    if (shot === '1' || shot === 'cover') {
      // Scene 1: Start level view with patrolling guards and cones
      this.level.player.x = 90;
      this.level.player.y = 660;
      this.level.player.angle = -Math.PI / 2;
      this.detectionMeter = 0.08;
    } else if (shot === '2' || shot === 'patrol') {
      // Scene 2: Player sneaking behind cover while a cone sweeps past
      this.level.player.x = 135;
      this.level.player.y = 210;
      this.level.player.isSneaking = true;
      this.level.player.angle = Math.PI / 2;
      const g = this.guardManager.getGuards()[0];
      if (g) {
        g.x = 55;
        g.y = 210;
        g.angle = 0;
        g.pauseTimer = 2.0;
        g.baseAngle = 0;
      }
      this.detectionMeter = 0.22;
    } else if (shot === '3' || shot === 'near-miss') {
      // Scene 3: Near-miss moment, high detection meter and alarm tint
      this.level.player.x = 680;
      this.level.player.y = 110;
      this.level.player.isSneaking = false;
      this.level.player.angle = 0;
      const g = this.guardManager.getGuards()[1];
      if (g) {
        g.x = 530;
        g.y = 110;
        g.angle = 0;
        g.isAlert = true;
        g.alertTimer = 3.5;
      }
      this.guardManager.triggerAlert(3.5);
      this.isAlert = true;
      this.wasEverAlerted = true;
      this.detectionMeter = 0.82;
    } else if (shot === '4' || shot === 'exit') {
      // Scene 4: Player reached vault exit with all intel folders
      this.level.player.x = 1205;
      this.level.player.y = 215;
      this.level.player.angle = 0;
      this.level.intelFolders.forEach((f) => (f.collected = true));
      this.collectedIntel = [1, 2, 3];
      this.detectionMeter = 0.0;
      this.missionTime = 42.6;
      this.screen = SCREEN.WON;
    }
  }

  update(dt) {
    if (this.screen === SCREEN.MENU) {
      if (input.isJustPressed('Space') || input.isJustPressed('Enter')) {
        this.screen = SCREEN.PLAYING;
      }
      return;
    }

    if (input.isJustPressed('KeyR')) {
      this.restart();
      return;
    }

    if (input.isJustPressed('KeyP') || input.isJustPressed('Escape')) {
      if (this.screen === SCREEN.PLAYING) {
        this.screen = SCREEN.PAUSED;
      } else if (this.screen === SCREEN.PAUSED) {
        this.screen = SCREEN.PLAYING;
      }
      return;
    }

    if (this.screen === SCREEN.PAUSED) {
      return;
    }

    if (this.screen === SCREEN.CAUGHT || this.screen === SCREEN.WON) {
      if (input.isJustPressed('Space') || input.isJustPressed('Enter')) {
        this.restart();
      }
      return;
    }

    this.missionTime += dt;

    // 1. Player movement and footstep timing
    const { dx, dy } = input.getMovementVector();
    this.level.player.isSneaking = input.isSneaking();
    movePlayer(this.level.player, dx, dy, dt, this.level);

    if (dx !== 0 || dy !== 0) {
      this.level.player.footstepTimer += dt;
      const stepInterval = this.level.player.isSneaking
        ? PLAYER.footstepIntervalSneak
        : PLAYER.footstepIntervalWalk;
      if (this.level.player.footstepTimer >= stepInterval) {
        this.level.player.footstepTimer = 0;
        sound.playFootstep(this.level.player.isSneaking);
      }
    }

    // 2. Guard patrol AI and footstep sounds
    this.guardManager.update(dt, (guard) => {
      const dist = Math.hypot(this.level.player.x - guard.x, this.level.player.y - guard.y);
      sound.playGuardFootstep(dist);
    });

    // 3. Vision raycasting & detection evaluation
    const visionResult = this.visionSystem.update(
      dt,
      this.level.player,
      this.guardManager.getGuards(),
      this.level,
      (alertDuration) => {
        this.guardManager.triggerAlert(alertDuration);
        sound.playAlarmBlip();
      }
    );

    this.detectionMeter = visionResult.detectionMeter;
    this.isAlert = visionResult.isAlert;
    if (this.isAlert) {
      this.wasEverAlerted = true;
    }

    sound.updateDetectionSting(this.detectionMeter);

    if (visionResult.isCaught) {
      this.screen = SCREEN.CAUGHT;
      sound.playCaught();
    }

    // Calculate full occluded vision cones for rendering
    this.visionCones = this.guardManager.getGuards().map((g) =>
      this.visionSystem.calculateGuardCone(g, this.level.segments)
    );

    // 4. Intel Collection
    for (const folder of this.level.intelFolders) {
      if (!folder.collected) {
        const dist = Math.hypot(this.level.player.x - folder.x, this.level.player.y - folder.y);
        if (dist < this.level.player.radius + folder.radius + 6) {
          folder.collected = true;
          this.collectedIntel.push(folder.id);
          sound.playFolderCollect();
        }
      }
    }

    // 5. Vault Exit Trigger
    const tr = this.level.vaultExit.trigger;
    const px = this.level.player.x;
    const py = this.level.player.y;
    if (px >= tr.x && px <= tr.x + tr.w && py >= tr.y && py <= tr.y + tr.h) {
      this.screen = SCREEN.WON;
      sound.playVictory();
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);

    const gameState = {
      screen: this.screen,
      level: this.level,
      player: this.level.player,
      guards: this.guardManager.getGuards(),
      visionCones: this.visionCones,
      detectionMeter: this.detectionMeter,
      isAlert: this.isAlert,
      collectedIntel: this.collectedIntel,
      missionTime: this.missionTime,
      wasEverAlerted: this.wasEverAlerted,
    };
    this.renderer.render(gameState, dt);

    input.endFrame();
    requestAnimationFrame(this.loop.bind(this));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
