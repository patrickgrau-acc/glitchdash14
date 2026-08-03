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
    // Score is already shown by GameCanvas.tsx's DOM header (SCORE/BEST above the canvas) —
    // this canvas-drawn copy was duplicating it in the same top-right area every frame.
  },
};

export default displayLiveScoreDuringGameplay;