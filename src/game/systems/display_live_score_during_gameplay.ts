// Implements: SPEC-055 (Display Live Score during Gameplay)
// Satisfies: TS-0055 (Verify live score update and visual compliance during active gameplay)

import type { GameSystem, GameState, InputState } from '../types';

/**
 * DisplayLiveScoreDuringGameplay
 * 
 * Satisfies TS-0055 and UC: Display Live Score during Gameplay (bWehq20xwXpcxWHgXj1W).
 * Renders an accessible, bold, chunky, high-contrast live score display during active
 * gameplay ('playing' phase) without obstructing the core gameplay movement area.
 * Consumes state.events to trigger visual feedback pulses on point-scored events.
 */
const displayLiveScoreDuringGameplay: GameSystem = {
  id: 'display_live_score_during_gameplay',
  order: 60,

  reset(state: GameState) {
    state.data.liveScoreDisplay = {
      pulseTimer: 0,
      lastScore: 0,
    };
  },

  update(state: GameState, input: InputState, dt: number) {
    if (!state.data.liveScoreDisplay) {
      state.data.liveScoreDisplay = {
        pulseTimer: 0,
        lastScore: 0,
      };
    }

    const data = state.data.liveScoreDisplay;

    // Decay the pulse timer for score increment animation
    if (data.pulseTimer > 0) {
      data.pulseTimer = Math.max(0, data.pulseTimer - dt);
    }

    // Check if score changed or 'score' event occurred
    if (state.score !== data.lastScore) {
      data.pulseTimer = 0.3; // 300ms pop animation
      data.lastScore = state.score;
    }

    // Also inspect state.events for explicit 'score' or progression tags
    if (state.events && state.events.includes('score')) {
      data.pulseTimer = 0.3;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    if (state.phase !== 'playing') return;

    const data = state.data.liveScoreDisplay || { pulseTimer: 0, lastScore: state.score };
    const scoreVal = Math.floor(state.score || 0);

    ctx.save();
    
    // Position cleanly in the top-right corner to avoid obstructing core movement area
    const x = state.width - 24;
    const y = 36;

    const scale = 1 + (data.pulseTimer > 0 ? 0.25 * (data.pulseTimer / 0.3) : 0);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Bold, chunky, irreverent arcade typography adhering to high-contrast accessibility standards
    ctx.font = '900 28px Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // High contrast backdrop shadow/glow for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillText(`SCORE: ${scoreVal}`, 2, 2);

    // Primary high-contrast text color (Material You theme accent / bright foreground)
    ctx.fillStyle = data.pulseTimer > 0 ? '#4ff0b7' : '#ffffff';
    ctx.fillText(`SCORE: ${scoreVal}`, 0, 0);

    ctx.restore();
    ctx.restore();
  },
};

export default displayLiveScoreDuringGameplay;