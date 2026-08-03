/**
 * Implements: SPEC-042, SPEC-043
 * Satisfies: TS-0025, TS-0026
 * 
 * Store Session High Score system for GlitchDash14.
 * Tracks session best score in memory across game runs and updates 
 * state.score / state.best accordingly when runs end or scores are achieved.
 */

import { GameSystem, GameState, InputState } from '../types';

interface HighScoreData {
  sessionBest: number;
  lastFinalScore: number;
  resetOnNextRun: boolean;
}

const storeSessionHighScoreSystem: GameSystem = {
  id: 'store_session_high_score',
  order: 25,

  reset(state: GameState): void {
    // Initialize or retrieve session high score storage in state.data
    if (!state.data.storeHighScore) {
      state.data.storeHighScore = {
        sessionBest: state.best || 0,
        lastFinalScore: 0,
        resetOnNextRun: false,
      } as HighScoreData;
    }

    const data = state.data.storeHighScore as HighScoreData;
    // Ensure state.best matches sessionBest at start of run
    state.best = Math.max(state.best || 0, data.sessionBest);
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.storeHighScore) {
      state.data.storeHighScore = {
        sessionBest: state.best || 0,
        lastFinalScore: 0,
        resetOnNextRun: false,
      } as HighScoreData;
    }

    const data = state.data.storeHighScore as HighScoreData;

    // Check events emitted by base_player or other systems
    const events = state.events || [];

    // If game transitions to 'over' or score updates during 'playing'
    if (state.phase === 'over') {
      const currentScore = Math.floor(state.score || 0);
      if (currentScore > data.sessionBest) {
        data.sessionBest = currentScore;
        state.best = currentScore;
      } else if (state.best < data.sessionBest) {
        state.best = data.sessionBest;
      }
    } else if (state.phase === 'playing') {
      // Continuously track personal best during active run
      const currentScore = Math.floor(state.score || 0);
      if (currentScore > data.sessionBest) {
        data.sessionBest = currentScore;
        state.best = currentScore;
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Background tracking system — UI surface ownership relies on GameCanvas HUD
    // but we can expose active high score metrics via state.data for inspection or telemetry
    if (state.data.storeHighScore) {
      const data = state.data.storeHighScore as HighScoreData;
      state.data.liveHighScoreDisplay = data.sessionBest;
    }
  },
};

export default storeSessionHighScoreSystem;