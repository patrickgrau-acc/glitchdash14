/**
 * # Implements: SPEC-042 (Implicit/Explicit Debug Calibration Mode)
 * # Satisfies: TS-0012, TS-0014, TS-0023
 */

import { GameSystem, GameState, InputState } from '../types';

/**
 * System implementing Debug Mode for Real-Time Calibration in GlitchDash14.
 * Tracks session elapsed time, current calculated speed, and obstacle/spawn frequency metrics,
 * presenting an accessible, school-safe semi-transparent diagnostic overlay when enabled.
 */
const debugModeSystem: GameSystem = {
  id: 'implement_debug_mode_real_time',
  order: 100,

  reset(state: GameState) {
    // Initialize debug metrics storage within permissive game state data scratchpad
    state.data.debug = {
      // Toggle to enable/disable debug overlay (set to true for calibration testing per TS-0012)
      enabled: true,
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

    // Toggle debug mode on pressing 'KeyM' (M key) or configured debug flag
    if (input.justPressed.has('KeyM')) {
      debug.enabled = !debug.enabled;
    }

    if (state.phase === 'playing') {
      debug.elapsedTime += dt;
      debug.currentSpeed = state.data.globalSpeedMultiplier !== undefined 
        ? (state.data.globalSpeedMultiplier * 10).toFixed(1) 
        : (10 + (debug.elapsedTime * 0.5)).toFixed(1);
      
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
    const boxHeight = 110;
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
    ctx.fillText(`Speed: ${debug.currentSpeed} units/s`, textX, textY);
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