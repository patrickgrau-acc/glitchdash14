/**
 * Implements: SPEC-042, SPEC-043
 * Satisfies: TS-0105, TS-0108
 * Game system responsible for updating and preserving persistent high scores in localStorage.
 */

import { GameSystem, GameState } from '../types';

const HIGH_SCORE_KEY = 'highScore';

const updatePersistentHighScoreSystem: GameSystem = {
  id: 'update_persistent_high_score',
  order: 50,

  reset(state: GameState): void {
    // Read existing high score from localStorage on reset/init
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = stored !== null ? parseInt(stored, 10) : 0;
      const currentHighScore = isNaN(parsed) ? 0 : parsed;
      state.best = currentHighScore;
      state.data.highScoreRetrieved = true;
    } catch (e) {
      // Fallback if localStorage is restricted
      state.best = state.best || 0;
    }
  },

  update(state: GameState, input, dt): void {
    // Check if game is in 'over' phase or if score needs updating upon game conclusion
    if (state.phase === 'over') {
      try {
        const stored = localStorage.getItem(HIGH_SCORE_KEY);
        const currentSavedScore = stored !== null ? parseInt(stored, 10) : 0;
        const validSavedScore = isNaN(currentSavedScore) ? 0 : currentSavedScore;

        if (state.score > validSavedScore) {
          localStorage.setItem(HIGH_SCORE_KEY, String(state.score));
          state.best = state.score;
        } else {
          state.best = validSavedScore;
        }
      } catch (e) {
        // Fallback if storage fails
        if (state.score > state.best) {
          state.best = state.score;
        }
      }
    }
  },
};

export default updatePersistentHighScoreSystem;