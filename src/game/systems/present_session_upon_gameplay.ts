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
    if (state.phase === 'over') {
      // Juice / presentation enhancement for Game Over summary screen
      ctx.save();
      ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
      ctx.fillRect(0, 0, state.width, state.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ffcc';
      ctx.font = 'bold 28px Roboto, sans-serif';
      ctx.fillText('GLITCH SESSION SUMMARY', state.width / 2, state.height / 2 - 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Roboto, sans-serif';
      ctx.fillText(`Final Score: ${state.data.sessionFinalScore ?? state.score}`, state.width / 2, state.height / 2 - 20);
      ctx.fillText(`Personal Best: ${state.best}`, state.width / 2, state.height / 2 + 20);

      ctx.fillStyle = '#a855f7';
      ctx.font = '14px Roboto, sans-serif';
      ctx.fillText('PRESS RETRY TO START A NEW RUN', state.width / 2, state.height / 2 + 70);
      ctx.restore();
    }
  }
}

export default new PresentSessionSummarySystem();