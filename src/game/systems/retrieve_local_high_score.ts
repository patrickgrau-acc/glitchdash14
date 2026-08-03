/**
 * Implements: SPEC-RETRIEVE-HIGH-SCORE
 * Satisfies: TS-0107 (Retrieve high score from localStorage = 500), TS-0111 (Default high score to 0 when empty)
 * Mechanic: Retrieve Local High Score
 * EPIC: Local Session Progress Management
 */

import { GameSystem, GameState, InputState } from '../types';

const STORAGE_KEY = 'highScore';

const retrieveLocalHighScoreSystem: GameSystem = {
  id: 'retrieve_local_high_score',
  order: 10,

  reset(state: GameState): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored !== undefined && stored !== '') {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) {
          state.best = parsed;
          state.data.highScoreRetrieved = parsed;
        } else {
          state.best = 0;
          state.data.highScoreRetrieved = 0;
        }
      } else {
        state.best = 0;
        state.data.highScoreRetrieved = 0;
      }
    } catch (e) {
      // Fallback if localStorage is restricted or throws
      state.best = 0;
      state.data.highScoreRetrieved = 0;
    }
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure that whenever score exceeds best, best is updated and synced
    if (state.score > state.best) {
      state.best = state.score;
      try {
        localStorage.setItem(STORAGE_KEY, String(state.best));
      } catch (e) {
        // Ignore localStorage write errors
      }
    }

    // Also check if high score was updated in localStorage externally
    if (state.phase === 'ready' || state.phase === 'over') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > state.best) {
            state.best = parsed;
          }
        }
      } catch (e) {
        // Ignore
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Non-intrusive rendering: Exposes state.data for HUD/UI or displays subtle high score badge if needed
  }
};

export default retrieveLocalHighScoreSystem;