/**
 * # Implements: SPEC-042 (Implicit/Explicit Debug Calibration Mode)
 * # Satisfies: TS-0012, TS-0014, TS-0023
 */

import { GameSystem, GameState, InputState } from '../types';

const DEBUG_ENABLED_STORAGE_KEY = 'glitchdash14_debug_enabled';

function loadDebugEnabled(): boolean {
  try { return localStorage.getItem(DEBUG_ENABLED_STORAGE_KEY) === 'true'; }
  catch { return false; }
}

function saveDebugEnabled(val: boolean): void {
  try { localStorage.setItem(DEBUG_ENABLED_STORAGE_KEY, String(val)); } catch { /* ignore */ }
}

/**
 * System implementing Debug Mode for Real-Time Calibration in GlitchDash14.
 * Tracks session elapsed time, current calculated speed, and obstacle/spawn frequency metrics,
 * presenting an accessible, school-safe semi-transparent diagnostic overlay when enabled.
 */
const debugModeSystem: GameSystem = {
  id: 'implement_debug_mode_real_time',
  order: 100,

  reset(state: GameState) {
    // Restore the player's last choice instead of hardcoding false — engine.ts's
    // startRun() wipes state.data on every restart, so without this the overlay
    // silently turned back off every new game regardless of what was selected.
    state.data.debug = {
      enabled: loadDebugEnabled(),
      elapsedTime: 0,
      currentSpeed: 0,
      obstacleFrequency: 0,
      frameCount: 0,
      fps: 60,
      lastFpsUpdate: performance.now(),
    };
  },

  update(state: GameState, input: InputState, dt: number) {
    const debug = state.data.debug;
    if (!debug) return;

    // Dedicated debug key (not 'KeyM' — that's already the audio mute toggle)
    if (input.justPressed.has('Backquote')) {
      debug.enabled = !debug.enabled;
      saveDebugEnabled(debug.enabled);
    }

    if (state.phase === 'playing') {
      debug.elapsedTime += dt;
      // state.data.speed is base_player.ts's actual applied scroll speed (px/s) — it already
      // factors in both the automatic difficulty curve AND the Speed Modifier slider. The old
      // `globalSpeedMultiplier * 10` ignored the slider entirely, so this overlay looked
      // unresponsive to it even though the slider was genuinely wired into gameplay.
      debug.currentSpeed = typeof state.data.speed === 'number' ? state.data.speed.toFixed(0) : '0';
      debug.speedModifier = typeof state.data.speedModifier === 'number' ? state.data.speedModifier.toFixed(2) : '1.00';
      // Mirrors base_player.ts's own gapMul/gravMul clamp formulas (that file is locked, so
      // this can't read a shared computed value from it) — showing the raw gapSize/
      // gravityMultiplier slider alone would repeat the same mistake the old Speed line
      // made: it'd only reflect the slider, not the actual combined value gameplay applies
      // (obstacleGapFactor from the automatic difficulty curve is a second factor on gap).
      const gapMul = Math.min(4, Math.max(0.25, (state.data.obstacleGapFactor ?? 1) * (state.data.gapSize ?? 1)));
      const gravMul = Math.min(3, Math.max(0.3, state.data.gravityMultiplier ?? 1));
      debug.gapMul = gapMul.toFixed(2);
      debug.gravMul = gravMul.toFixed(2);

      // Calculate active obstacle frequency from entities
      const obstacles = state.entities.filter(e => e.kind === 'obstacle' || e.kind === 'glitch');
      debug.obstacleFrequency = obstacles.length;

      // Track running FPS for accessibility & performance diagnostic (TS-0014)
      debug.frameCount++;
      const now = performance.now();
      if (now - debug.lastFpsUpdate >= 1000) {
        debug.fps = Math.round((debug.frameCount * 1000) / (now - debug.lastFpsUpdate));
        debug.frameCount = 0;
        debug.lastFpsUpdate = now;
      }
    } else if (state.phase === 'ready') {
      debug.elapsedTime = 0;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    const debug = state.data.debug;
    if (!debug || !debug.enabled) return;

    ctx.save();
    
    // Draw high-contrast, school-safe semi-transparent diagnostic box in top-right corner
    const boxWidth = 220;
    const boxHeight = 128;
    const padding = 15;
    const x = state.width - boxWidth - padding;
    const y = padding;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Diagnostic text labels & values
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Roboto, monospace';
    ctx.textAlign = 'left';

    const textX = x + 12;
    let textY = y + 22;
    const lineHeight = 18;

    ctx.fillText('=== DEBUG CALIBRATION ===', textX, textY);
    textY += lineHeight;
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`Speed: ${debug.currentSpeed} px/s (mod x${debug.speedModifier ?? '1.00'})`, textX, textY);
    textY += lineHeight;
    ctx.fillText(`Gap x${debug.gapMul ?? '1.00'}  Gravity x${debug.gravMul ?? '1.00'}`, textX, textY);
    textY += lineHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Elapsed Time: ${debug.elapsedTime.toFixed(1)}s`, textX, textY);
    textY += lineHeight;
    ctx.fillText(`Obstacle Count: ${debug.obstacleFrequency}`, textX, textY);
    textY += lineHeight;
    ctx.fillStyle = '#a0aec0';
    ctx.fillText(`FPS: ${debug.fps} | Phase: ${state.phase}`, textX, textY);

    ctx.restore();
  }
};

export default debugModeSystem;