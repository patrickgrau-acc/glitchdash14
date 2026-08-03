// Implements: SPEC-0060, SPEC-0069
// Satisfies: TS-0060, TS-0069
import { GameSystem, GameState, InputState } from '../types';

interface FinalSessionData {
  lastRecordedScore: number;
  bestScoreStored: number;
  gameOverNotificationPlayed: boolean;
}

const STORAGE_KEY = 'glitchdash14_high_score';

/**
 * calculate_display_final_session system
 * Calculates final session results upon collision (phase transition to 'over'),
 * handles high score persistence in local storage across multiple death cycles,
 * and renders high-energy, bold, meme-appropriate typography on the game over screen.
 */
const calculateDisplayFinalSessionSystem: GameSystem = {
  id: 'calculate_display_final_session',
  order: 60,

  reset(state: GameState): void {
    const data = (state.data.calculateDisplayFinalSession = state.data.calculateDisplayFinalSession || {}) as FinalSessionData;
    data.lastRecordedScore = 0;
    data.gameOverNotificationPlayed = false;

    // Load persistent best score from local storage safely
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      data.bestScoreStored = stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      data.bestScoreStored = 0;
    }
  },

  update(state: GameState, _input: InputState, _dt: number): void {
    const data = (state.data.calculateDisplayFinalSession = state.data.calculateDisplayFinalSession || {}) as FinalSessionData;

    // Ensure state.best reflects our loaded high score initially or if higher
    if (state.best < data.bestScoreStored) {
      state.best = data.bestScoreStored;
    } else if (state.best > data.bestScoreStored) {
      data.bestScoreStored = state.best;
      try {
        localStorage.setItem(STORAGE_KEY, String(data.bestScoreStored));
      } catch {
        // Storage restricted
      }
    }

    if (state.phase === 'over') {
      if (!data.gameOverNotificationPlayed) {
        data.lastRecordedScore = Math.floor(state.score);
        if (data.lastRecordedScore > data.bestScoreStored) {
          data.bestScoreStored = data.lastRecordedScore;
          state.best = data.bestScoreStored;
          try {
            localStorage.setItem(STORAGE_KEY, String(data.bestScoreStored));
          } catch {
            // Storage restricted
          }
        }
        data.gameOverNotificationPlayed = true;
        state.events.push('final_session_calculated');
      }
    } else if (state.phase === 'playing') {
      data.gameOverNotificationPlayed = false;
      data.lastRecordedScore = Math.floor(state.score);
      if (data.lastRecordedScore > state.best) {
        state.best = data.lastRecordedScore;
        try {
          localStorage.setItem(STORAGE_KEY, String(state.best));
        } catch {
          // Storage restricted
        }
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (state.phase !== 'over') return;

    // GameCanvas.tsx's DOM overlay already owns: the "GAME OVER — score X" status
    // line, the current score & best-score header above the canvas, the RETRY
    // button, and the input hint — all centered over this exact area. This system
    // previously redrew a whole second bordered panel with its own final score,
    // session best, and retry hint UNDER that overlay, which is why the game-over
    // screen showed two boxes and overlapping duplicate text. The one thing here
    // that ISN'T shown anywhere else is the meme remark, so that's all that's left,
    // moved to the top of the canvas so it doesn't sit under the DOM overlay's
    // centered content.
    const data = (state.data.calculateDisplayFinalSession = state.data.calculateDisplayFinalSession || {}) as FinalSessionData;
    const finalScore = data.lastRecordedScore || Math.floor(state.score);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 22px Roboto, sans-serif';
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 10;
    const memePhrases = [
      'BRO REALLY HIT A WALL 💀',
      'ABSOLUTE SKILL ISSUE 📉',
      'BRO PLAYED WITH NO HANDS 💀',
      'ERROR 404: SKILL NOT FOUND 🤡'
    ];
    // Pick phrase deterministically or stable based on score
    const phraseIndex = Math.abs(finalScore) % memePhrases.length;
    ctx.fillText(memePhrases[phraseIndex], state.width / 2, 46);

    ctx.restore();
  }
};

export default calculateDisplayFinalSessionSystem;