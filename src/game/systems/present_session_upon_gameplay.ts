// Implements: SPEC-ZXMWC (Present Session Summary upon Gameplay Termination)
// Satisfies: TS-0088, TS-0099
import { GameSystem, GameState, InputState } from '../types';

/**
 * Present Session Summary upon Gameplay Termination (zxMwc7A0miUQq8afKbka)
 * Manages game over state summary data, retrieves and compares high scores from localStorage,
 * and tracks retry interaction readiness for the session termination phase.
 */
class PresentSessionSummarySystem implements GameSystem {
  id = 'present_session_upon_gameplay';
  order = 50;

  reset(state: GameState): void {
    state.data.summaryViewed = false;
    state.data.highScoreRetrieved = false;
    state.data.sessionFinalScore = 0;
  }

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase === 'over') {
      if (!state.data.summaryViewed) {
        state.data.summaryViewed = true;
        state.data.sessionFinalScore = state.score;

        try {
          const stored = localStorage.getItem('glitchdash_high_score');
          const currentBest = stored ? parseInt(stored, 10) || 0 : 0;
          if (state.score > currentBest) {
            localStorage.setItem('glitchdash_high_score', String(state.score));
            state.best = state.score;
          } else {
            state.best = Math.max(state.score, currentBest);
          }
          state.data.highScoreRetrieved = true;
          state.data.localHighScore = state.best;
        } catch (e) {
          // Fallback if localStorage is restricted
          state.best = Math.max(state.score, state.best);
          state.data.localHighScore = state.best;
        }
      }
    } else {
      if (state.data.summaryViewed) {
        state.data.summaryViewed = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Render nothing for 'over' phase to avoid duplicating the backdrop owned by enable_instant_gameplay_restart
  }
}

const presentSessionSummarySystem = new PresentSessionSummarySystem();
export default presentSessionSummarySystem;
