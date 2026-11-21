/**
 * NIGHTWATCH: Silent Wing - Canvas Vector Renderer
 * Renders the facility, lighting, cover objects, vision cones, actors, HUD and overlay screens.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE, SCREEN } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
  }

  render(gameState, dt) {
    this.time += dt;
    const ctx = this.ctx;
    const { screen, level, player, guards, visionCones, detectionMeter, isAlert, collectedIntel, missionTime } = gameState;

    // 1. Clear background
    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Render Facility Floor & Grid
    this.drawFloor(ctx);

    // 3. Render Warm Lamp Light Pools
    this.drawLamps(ctx, level.lamps);

    // 4. Render Cover Objects (floor layer: crates, desks, shelves)
    this.drawCover(ctx, level.cover);

    // 5. Render Intel Folders
    this.drawIntelFolders(ctx, level.intelFolders);

    // 6. Render Exit Vault Door
    this.drawVaultExit(ctx, level.vaultExit);

    // 7. Render Vision Cones (rendered beneath guards and walls)
    if (visionCones && visionCones.length > 0) {
      this.drawVisionCones(ctx, visionCones, isAlert);
    }

    // 8. Render Structural Walls (walls cast occluding depth)
    this.drawWalls(ctx, level.walls);

    // 9. Render Pillars and Plants (elevated cover)
    this.drawPillarsAndPlants(ctx, level.cover);

    // 10. Render Guards
    if (guards) {
      for (const guard of guards) {
        this.drawGuard(ctx, guard);
      }
    }

    // 11. Render Player
    if (player) {
      this.drawPlayer(ctx, player);
    }

    // 12. Render Tactical HUD
    this.drawHUD(ctx, gameState);

    // 13. Render Overlays (Menu, Paused, Caught, Won)
    if (screen === SCREEN.MENU) {
      this.drawMenuScreen(ctx);
    } else if (screen === SCREEN.PAUSED) {
      this.drawPauseScreen(ctx);
    } else if (screen === SCREEN.CAUGHT) {
      this.drawCaughtScreen(ctx, gameState);
    } else if (screen === SCREEN.WON) {
      this.drawWonScreen(ctx, gameState);
    }
  }

  drawFloor(ctx) {
    // Base facility floor
    ctx.fillStyle = PALETTE.floorBase;
    ctx.fillRect(20, 50, 1240, 730);

    // Architectural tile grid (40px cells)
    ctx.strokeStyle = PALETTE.floorGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 20; x <= 1260; x += 40) {
      ctx.moveTo(x, 50);
      ctx.lineTo(x, 780);
    }
    for (let y = 50; y <= 780; y += 40) {
      ctx.moveTo(20, y);
      ctx.lineTo(1260, y);
    }
    ctx.stroke();

    // Subtle room labeling on floor
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SEC-01 // WEST ARCHIVE STACKS', 45, 80);
    ctx.fillText('SEC-02 // CENTRAL SECURITY CHECKPOINT', 430, 80);
    ctx.fillText('SEC-03 // SOUTH LOGISTICS BAY', 400, 510);
    ctx.fillText('SEC-04 // RESTRICTED ARCHIVE', 950, 510);
    ctx.fillText('SEC-05 // HIGH-SECURITY VAULT', 950, 80);
  }

  drawLamps(ctx, lamps) {
    for (const lamp of lamps) {
      const grad = ctx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, lamp.radius);
      grad.addColorStop(0, `${PALETTE.lampWarm}0.45)`);
      grad.addColorStop(0.5, `${PALETTE.lampWarm}0.22)`);
      grad.addColorStop(1, `${PALETTE.lampWarm}0.0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ceiling fixture mount dot
      ctx.fillStyle = PALETTE.lampCenter;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  drawCover(ctx, cover) {
    for (const item of cover) {
      if (item.kind === 'crate') {
        this.drawCrate(ctx, item);
      } else if (item.kind === 'shelf') {
        this.drawShelf(ctx, item);
      } else if (item.kind === 'desk') {
        this.drawDesk(ctx, item);
      }
    }
  }

  drawCrate(ctx, c) {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(c.x + 3, c.y + 3, c.w, c.h);

    // Crate base wood
    ctx.fillStyle = PALETTE.crateBase;
    ctx.fillRect(c.x, c.y, c.w, c.h);

    // Crate border trim
    ctx.strokeStyle = PALETTE.crateTrim;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);

    // Diagonal reinforcement brace
    ctx.beginPath();
    ctx.moveTo(c.x + 2, c.y + 2);
    ctx.lineTo(c.x + c.w - 2, c.y + c.h - 2);
    ctx.moveTo(c.x + c.w - 2, c.y + 2);
    ctx.lineTo(c.x + 2, c.y + c.h - 2);
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = '#785635';
    ctx.fillRect(c.x + 3, c.y + 3, 3, 3);
    ctx.fillRect(c.x + c.w - 6, c.y + 3, 3, 3);
    ctx.fillRect(c.x + 3, c.y + c.h - 6, 3, 3);
    ctx.fillRect(c.x + c.w - 6, c.y + c.h - 6, 3, 3);
  }

  drawShelf(ctx, s) {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(s.x + 3, s.y + 3, s.w, s.h);

    // Base metal frame
    ctx.fillStyle = PALETTE.shelfBase;
    ctx.fillRect(s.x, s.y, s.w, s.h);

    ctx.strokeStyle = PALETTE.shelfDivider;
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, s.y, s.w, s.h);

    // Shelf dividers & book bindings
    const dividers = Math.floor(s.h / 24);
    for (let i = 1; i < dividers; i++) {
      const y = s.y + (i * s.h) / dividers;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x + 2, y);
      ctx.lineTo(s.x + s.w - 2, y);
      ctx.stroke();

      // Colored binder spines
      ctx.fillStyle = i % 2 === 0 ? '#334155' : '#1e3a5f';
      ctx.fillRect(s.x + 4, y - 14, s.w - 8, 10);
    }
  }

  drawDesk(ctx, d) {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(d.x + 3, d.y + 3, d.w, d.h);

    // Desk console surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(d.x, d.y, d.w, d.h);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x, d.y, d.w, d.h);

    // Console terminal screen glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(d.x + 10, d.y + 8, d.w - 20, d.h - 16);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(d.x + 10, d.y + 8, d.w - 20, d.h - 16);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(d.label ?? 'TERMINAL', d.x + d.w / 2, d.y + d.h / 2 + 3);
  }

  drawPillarsAndPlants(ctx, cover) {
    for (const item of cover) {
      if (item.kind === 'pillar') {
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(item.x + 3, item.y + 3, item.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pillar body
        const grad = ctx.createRadialGradient(
          item.x - 4,
          item.y - 4,
          2,
          item.x,
          item.y,
          item.radius
        );
        grad.addColorStop(0, '#475569');
        grad.addColorStop(0.7, '#1e293b');
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (item.kind === 'plant') {
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(item.x + 2, item.y + 2, item.radius, 0, Math.PI * 2);
        ctx.fill();

        // Potted plant ceramic base
        ctx.fillStyle = PALETTE.plantPot;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Leaves (cluster of green circles)
        const angles = [0, 1.25, 2.5, 3.75, 5.0];
        for (const a of angles) {
          const lx = item.x + Math.cos(a) * (item.radius * 0.5);
          const ly = item.y + Math.sin(a) * (item.radius * 0.5);
          ctx.fillStyle = PALETTE.plantLeaf;
          ctx.beginPath();
          ctx.arc(lx, ly, item.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = PALETTE.plantLeafLight;
          ctx.beginPath();
          ctx.arc(lx - 1, ly - 1, item.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  drawWalls(ctx, walls) {
    for (const w of walls) {
      // Wall drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(w.x + 2, w.y + 2, w.w, w.h);

      // Wall core
      ctx.fillStyle = PALETTE.wallFill;
      ctx.fillRect(w.x, w.y, w.w, w.h);

      // Wall border stroke
      ctx.strokeStyle = PALETTE.wallBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.w, w.h);

      // Top edge highlight
      ctx.fillStyle = '#334155';
      ctx.fillRect(w.x + 1, w.y + 1, Math.max(0, w.w - 2), 2);
    }
  }

  drawIntelFolders(ctx, folders) {
    for (const f of folders) {
      if (f.collected) continue;

      const bobY = Math.sin(this.time * 3 + f.id) * 3;
      const cy = f.y + bobY;

      // Glow halo
      const grad = ctx.createRadialGradient(f.x, cy, 2, f.x, cy, 22);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      // Folder icon (cyan folder)
      ctx.fillStyle = PALETTE.intelFill;
      ctx.beginPath();
      // Tab
      ctx.roundRect ? ctx.roundRect(f.x - 11, cy - 8, 8, 4, 1) : ctx.rect(f.x - 11, cy - 8, 8, 4);
      ctx.fill();
      // Main body
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(f.x - 11, cy - 5, 22, 14, 2) : ctx.rect(f.x - 11, cy - 5, 22, 14);
      ctx.fill();

      ctx.fillStyle = '#082f49';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INTEL', f.x, cy + 5);
    }
  }

  drawVaultExit(ctx, vault) {
    const pulse = 0.65 + Math.sin(this.time * 4) * 0.35;

    // Glowing zone on floor
    const grad = ctx.createRadialGradient(
      vault.trigger.x + 20,
      vault.trigger.y + 45,
      10,
      vault.trigger.x + 20,
      vault.trigger.y + 45,
      60
    );
    grad.addColorStop(0, `rgba(16, 185, 129, ${0.45 * pulse})`);
    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(vault.trigger.x - 10, vault.trigger.y, vault.trigger.w + 10, vault.trigger.h);

    // Vault door frame
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(vault.doorX, vault.doorY, vault.doorW, vault.doorH);

    ctx.strokeStyle = PALETTE.vaultDoor;
    ctx.lineWidth = 3;
    ctx.strokeRect(vault.doorX, vault.doorY, vault.doorW, vault.doorH);

    // Hazard warning stripes
    ctx.fillStyle = PALETTE.vaultWarning;
    for (let y = vault.doorY; y < vault.doorY + vault.doorH; y += 14) {
      ctx.fillRect(vault.doorX + 2, y, vault.doorW - 4, 6);
    }

    // Glowing exit sign text
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('EXIT VAULT ▶', vault.doorX - 12, vault.doorY + 48);
  }

  drawVisionCones(ctx, visionCones, isAlert) {
    for (const cone of visionCones) {
      if (!cone.points || cone.points.length < 3) continue;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cone.points[0].x, cone.points[0].y);
      for (let i = 1; i < cone.points.length; i++) {
        ctx.lineTo(cone.points[i].x, cone.points[i].y);
      }
      ctx.closePath();

      // Cone gradient fill
      const grad = ctx.createRadialGradient(
        cone.guard.x,
        cone.guard.y,
        10,
        cone.guard.x,
        cone.guard.y,
        cone.guard.isAlert ? 245 : 215
      );

      if (cone.guard.isAlert || isAlert) {
        grad.addColorStop(0, PALETTE.coneAlertInner);
        grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
        grad.addColorStop(1, PALETTE.coneAlertOuter);
      } else {
        grad.addColorStop(0, PALETTE.coneNormalInner);
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.18)');
        grad.addColorStop(1, PALETTE.coneNormalOuter);
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Cone outer stroke
      ctx.strokeStyle = (cone.guard.isAlert || isAlert) ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawGuard(ctx, guard) {
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.rotate(guard.angle);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(2, 2, guard.radius, 0, Math.PI * 2);
    ctx.fill();

    const isAlert = guard.isAlert;

    // Body
    ctx.fillStyle = isAlert ? PALETTE.guardAlertBody : PALETTE.guardBody;
    ctx.beginPath();
    ctx.arc(0, 0, guard.radius, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = isAlert ? PALETTE.guardAlertCore : PALETTE.guardCore;
    ctx.beginPath();
    ctx.arc(0, 0, guard.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.strokeStyle = isAlert ? PALETTE.guardAlertRing : PALETTE.guardRing;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Directional visor / flashlight indicator
    ctx.fillStyle = isAlert ? PALETTE.guardAlertVisor : PALETTE.guardVisor;
    ctx.beginPath();
    ctx.moveTo(guard.radius + 3, 0);
    ctx.lineTo(guard.radius - 4, -5);
    ctx.lineTo(guard.radius - 4, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawPlayer(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Sneak aura ring when sneaking
    if (player.isSneaking) {
      const auraPulse = 18 + Math.sin(this.time * 8) * 3;
      ctx.strokeStyle = PALETTE.playerAura;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(2, 2, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Player body
    ctx.fillStyle = PALETTE.playerBody;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = PALETTE.playerCore;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Outer rim
    ctx.strokeStyle = PALETTE.playerRing;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Visor chevron pointing forward
    ctx.fillStyle = PALETTE.playerVisor;
    ctx.beginPath();
    ctx.moveTo(player.radius + 3, 0);
    ctx.lineTo(player.radius - 4, -4);
    ctx.lineTo(player.radius - 2, 0);
    ctx.lineTo(player.radius - 4, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawHUD(ctx, gameState) {
    const { detectionMeter, isAlert, collectedIntel, player } = gameState;

    // HUD top bar background
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 48);

    ctx.strokeStyle = isAlert ? 'rgba(239, 68, 68, 0.6)' : PALETTE.hudBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(CANVAS_WIDTH, 48);
    ctx.stroke();

    // Game Title & Mission
    ctx.fillStyle = PALETTE.textLight;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NIGHTWATCH', 25, 29);

    ctx.fillStyle = PALETTE.textHighlight;
    ctx.font = '12px monospace';
    ctx.fillText('SILENT WING', 125, 29);

    // Stance Indicator (Sneak vs Walk)
    const sneaking = player && player.isSneaking;
    ctx.fillStyle = sneaking ? '#2dd4bf' : '#64748b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`STANCE: ${sneaking ? 'SNEAKING [SHIFT]' : 'WALKING'}`, 260, 29);

    // Objective
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('OBJECTIVE: INFILTRATE TO EXIT VAULT', 480, 29);

    // Intel counter
    const collectedCount = collectedIntel ? collectedIntel.length : 0;
    ctx.fillStyle = collectedCount === 3 ? '#38bdf8' : '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`INTEL: ${collectedCount} / 3`, 780, 29);

    // Detection Meter Bar
    const meterX = 930;
    const meterY = 16;
    const meterW = 200;
    const meterH = 16;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DETECTION', meterX - 12, 29);

    // Bar background
    ctx.fillStyle = PALETTE.meterBack;
    ctx.fillRect(meterX, meterY, meterW, meterH);

    // Bar fill
    const meter = Math.max(0, Math.min(1.0, detectionMeter || 0));
    let meterColor = PALETTE.meterSafe;
    if (meter > 0.65 || isAlert) {
      meterColor = PALETTE.meterDanger;
    } else if (meter > 0.3) {
      meterColor = PALETTE.meterWarning;
    }

    ctx.fillStyle = meterColor;
    ctx.fillRect(meterX, meterY, meterW * meter, meterH);

    ctx.strokeStyle = isAlert ? '#ef4444' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(meterX, meterY, meterW, meterH);

    // Percentage text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(meter * 100)}%`, meterX + meterW / 2, meterY + 12);

    // Near-Miss Alert Banner
    if (isAlert) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚠ ALARM ACTIVE', 1150, 29);
    }
  }

  drawMenuScreen(ctx) {
    // Translucent dark overlay
    ctx.fillStyle = 'rgba(7, 11, 18, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;

    // Header box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 320, 140, 640, 520);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 320, 140, 640, 520);

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NIGHTWATCH', cx, 210);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('OPERATION: SILENT WING', cx, 245);

    // Story briefing
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText('Infiltrate the nocturnal archive facility unseen.', cx, 295);
    ctx.fillText('Cross the perimeter corridors to the glowing exit vault.', cx, 320);
    ctx.fillText('Retrieve 3 optional classified Intel Folders for GHOST rating.', cx, 345);

    // Controls
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('CONTROLS', cx, 395);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px monospace';
    ctx.fillText('WASD / Arrow Keys : Move Agent', cx, 430);
    ctx.fillText('Hold SHIFT : Sneak (Quieter, Slower Detection Build-up)', cx, 460);
    ctx.fillText('Avoid Lamps : Warm light pools double your visibility', cx, 490);
    ctx.fillText('P or ESC : Pause Mission   |   R : Quick Restart', cx, 520);

    // Start prompt with pulsing glow
    const pulse = 0.7 + Math.sin(this.time * 5) * 0.3;
    ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS SPACE OR CLICK TO BEGIN INFILTRATION', cx, 600);
  }

  drawPauseScreen(ctx) {
    ctx.fillStyle = 'rgba(7, 11, 18, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 180, cy - 80, 360, 160);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 180, cy - 80, 360, 160);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION PAUSED', cx, cy - 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText('Press P or ESC to Resume', cx, cy + 20);
    ctx.fillText('Press R to Restart Mission', cx, cy + 45);
  }

  drawCaughtScreen(ctx, gameState) {
    ctx.fillStyle = 'rgba(15, 6, 8, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    ctx.fillStyle = '#1e1014';
    ctx.fillRect(cx - 250, cy - 140, 500, 280);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 250, cy - 140, 500, 280);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DETECTION CONFIRMED', cx, cy - 70);

    ctx.fillStyle = '#fca5a5';
    ctx.font = '16px monospace';
    ctx.fillText('AGENT COMPROMISED BY SECURITY', cx, cy - 30);

    const intelCount = gameState.collectedIntel ? gameState.collectedIntel.length : 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`Intel Recovered: ${intelCount} / 3 Folders`, cx, cy + 20);
    ctx.fillText(`Time Elapsed: ${gameState.missionTime.toFixed(1)}s`, cx, cy + 45);

    const pulse = 0.7 + Math.sin(this.time * 6) * 0.3;
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PRESS R OR SPACE TO RETRY', cx, cy + 100);
  }

  drawWonScreen(ctx, gameState) {
    ctx.fillStyle = 'rgba(6, 18, 14, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    ctx.fillStyle = '#06281e';
    ctx.fillRect(cx - 280, cy - 180, 560, 360);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 280, cy - 180, 560, 360);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION ACCOMPLISHED', cx, cy - 110);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '16px monospace';
    ctx.fillText('VAULT BREACH & EXFILTRATION SUCCESSFUL', cx, cy - 70);

    // Rating determination
    const intelCount = gameState.collectedIntel ? gameState.collectedIntel.length : 0;
    const wasEverAlerted = gameState.wasEverAlerted;
    let rank = 'OPERATIVE';
    let rankColor = '#6ee7b7';

    if (!wasEverAlerted && intelCount === 3) {
      rank = 'GHOST (S-TIER)';
      rankColor = '#38bdf8';
    } else if (!wasEverAlerted) {
      rank = 'SHADOW (A-TIER)';
      rankColor = '#10b981';
    } else if (intelCount === 3) {
      rank = 'INFILTRATOR (B-TIER)';
      rankColor = '#f59e0b';
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`MISSION TIME: ${gameState.missionTime.toFixed(1)}s`, cx, cy - 15);
    ctx.fillText(`INTEL RETRIEVED: ${intelCount} / 3 CLASSIFIED FOLDERS`, cx, cy + 15);

    ctx.fillStyle = rankColor;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`STEALTH RATING: ${rank}`, cx, cy + 65);

    const pulse = 0.7 + Math.sin(this.time * 5) * 0.3;
    ctx.fillStyle = `rgba(52, 211, 153, ${pulse})`;
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PRESS R OR SPACE TO PLAY AGAIN', cx, cy + 135);
  }
}
