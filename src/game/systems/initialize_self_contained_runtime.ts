// Implements: SPEC-8qOAJvToUzaS7RHzdWMv
// Satisfies: TS-0104, TS-0109

import { GameSystem, GameState, InputState } from '../types';

/**
 * Initialize Self-Contained Runtime Environment (initialize_self_contained_runtime)
 * Ensures that all runtime state flags, offline cache settings, and core client-side
 * environment initialization parameters are correctly configured on startup.
 * Operates entirely client-side with zero external dependencies.
 */
const initializeSelfContainedRuntimeSystem: GameSystem = {
  id: 'initialize_self_contained_runtime',
  order: 5,

  reset(state: GameState): void {
    if (!state.data) {
      state.data = {};
    }
    // Initialize standalone client environment flags
    state.data.runtimeInitialized = true;
    state.data.offlineModeActive = true;
    state.data.localStorageAvailable = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    
    // Ensure high score retrieval tracking state exists without external calls
    if (state.data.highScoreRetrieved === undefined && state.data.localStorageAvailable) {
      try {
        const savedBest = window.localStorage.getItem('glitchdash_high_score');
        if (savedBest !== null) {
          const parsed = parseInt(savedBest, 10);
          if (!isNaN(parsed)) {
            state.best = Math.max(state.best || 0, parsed);
            state.data.highScoreRetrieved = true;
          }
        }
      } catch (e) {
        // Fallback gracefully if storage is restricted
        state.data.localStorageAvailable = false;
      }
    }
  },

  update(state: GameState, _input: InputState, _dt: number): void {
    if (!state.data) {
      state.data = {};
    }
    // Guarantee runtime environment is flagged as active
    if (!state.data.runtimeInitialized) {
      state.data.runtimeInitialized = true;
    }

    // Persist high score locally whenever it updates
    if (state.score > state.best) {
      state.best = state.score;
      if (state.data.localStorageAvailable) {
        try {
          window.localStorage.setItem('glitchdash_high_score', String(state.best));
        } catch (e) {
          // Ignore write restrictions in sandboxed iframes
        }
      }
    }
  },

  render(_ctx: CanvasRenderingContext2D, _state: GameState): void {
    // Pure runtime state management system; rendering handled by base game canvas & UI overlay.
  }
};

export default initializeSelfContainedRuntimeSystem;