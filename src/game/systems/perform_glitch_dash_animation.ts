// Implements: SPEC-042 (Glitch Dash), TS-0036, TS-0040, TS-0043
// Satisfies: Glitch Dash visual particle bursts, chromatic aberration effect, 60 FPS performance validation, single-button input tracking.

import { GameSystem, GameState, InputState } from '@/game/types';

interface DashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface DashSystemState {
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  particles: DashParticle[];
  aberrationIntensity: number;
  lastFpsCheck: number;
  frameCount: number;
  currentFps: number;
}

/**
 * Perform Glitch Dash Animation system.
 * Handles the visual feedback, chromatic aberration (RGB shift), particle bursts,
 * and high-performance validation for character's dash mechanic in active gameplay.
 */
const performGlitchDashAnimation: GameSystem = {
  id: 'perform_glitch_dash_animation',
  order: 35,

  reset(state: GameState): void {
    state.data.perform_glitch_dash_animation = {
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      particles: [],
      aberrationIntensity: 0,
      lastFpsCheck: performance.now(),
      frameCount: 0,
      currentFps: 60,
    } as DashSystemState;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') return;

    let sysState = state.data.perform_glitch_dash_animation as DashSystemState;
    if (!sysState) {
      sysState = {
        isDashing: false,
        dashTimer: 0,
        dashCooldown: 0,
        particles: [],
        aberrationIntensity: 0,
        lastFpsCheck: performance.now(),
        frameCount: 0,
        currentFps: 60,
      };
      state.data.perform_glitch_dash_animation = sysState;
    }

    // FPS & performance tracking for TS-0040
    sysState.frameCount++;
    const now = performance.now();
    if (now - sysState.lastFpsCheck >= 1000) {
      sysState.currentFps = Math.round((sysState.frameCount * 1000) / (now - sysState.lastFpsCheck));
      sysState.frameCount = 0;
      sysState.lastFpsCheck = now;
      state.data.currentFps = sysState.currentFps;
    }

    // Cooldown decrement
    if (sysState.dashCooldown > 0) {
      sysState.dashCooldown -= dt;
    }

    // Check events emitted by base_player or core runner for 'jump' or dash triggers
    const jumpedThisFrame = state.events.includes('jump');
    // Was checking the nonexistent code 'KeyShiftLeft' — the real KeyboardEvent.code
    // values are 'ShiftLeft'/'ShiftRight', so this alternate binding never fired.
    const requestedDash = input.justPressed.has('KeyX') || input.justPressed.has('ShiftLeft') || input.justPressed.has('ShiftRight') || (jumpedThisForm(jumpedThisFrame, sysState));

    function jumpedThisForm(jumped: boolean, s: DashSystemState): boolean {
      if (jumped && s.dashCooldown <= 0) {
        return true;
      }
      return false;
    }

    if (requestedDash && sysState.dashCooldown <= 0) {
      sysState.isDashing = true;
      sysState.dashTimer = 0.25; // 250ms dash burst duration
      sysState.dashCooldown = 0.6; // Cooldown
      sysState.aberrationIntensity = 12;

      // Spawn particle burst (TS-0036)
      const playerEntity = state.entities.find(e => e.kind === 'player');
      const px = playerEntity ? playerEntity.x + playerEntity.w / 2 : 100;
      const py = playerEntity ? playerEntity.y + playerEntity.h / 2 : state.height - 100;

      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * 220;
        sysState.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ff0055',
          life: 0,
          maxLife: 0.2 + Math.random() * 0.25,
        });
      }
      state.events.push('glitch_dash');
    }

    // Update dash active timer
    if (sysState.isDashing) {
      sysState.dashTimer -= dt;
      sysState.aberrationIntensity *= 0.85;
      if (sysState.dashTimer <= 0) {
        sysState.isDashing = false;
        sysState.aberrationIntensity = 0;
      }
    }

    // Update particles
    for (let i = sysState.particles.length - 1; i >= 0; i--) {
      const p = sysState.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if (p.life >= p.maxLife) {
        sysState.particles.splice(i, 1);
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (state.phase !== 'playing') return;
    const sysState = state.data.perform_glitch_dash_animation as DashSystemState;
    if (!sysState) return;

    ctx.save();

    // Render chromatic aberration effect on player during dash (TS-0043)
    if (sysState.isDashing && sysState.aberrationIntensity > 0.5) {
      const playerEntity = state.entities.find(e => e.kind === 'player');
      if (playerEntity) {
        ctx.save();
        // Cyan shift
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillRect(
          playerEntity.x - sysState.aberrationIntensity,
          playerEntity.y,
          playerEntity.w,
          playerEntity.h
        );
        // Magenta shift
        ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
        ctx.fillRect(
          playerEntity.x + sysState.aberrationIntensity,
          playerEntity.y,
          playerEntity.w,
          playerEntity.h
        );
        ctx.restore();
      }
    }

    // Render particle bursts (TS-0036)
    for (const p of sysState.particles) {
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    ctx.restore();
  },
};

export default performGlitchDashAnimation;