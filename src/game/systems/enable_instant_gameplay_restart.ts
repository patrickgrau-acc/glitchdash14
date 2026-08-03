/**
 * Implements: SPEC-INSTANT-RESTART, TS-0098, TS-0101
 * Satisfies instant gameplay restart, state reset, and session-based high score persistence.
 */

import { GameSystem, GameState, InputState } from '../types';

interface RestartSystemState {
  lastPhase: string;
  restartRequested: boolean;
}

const system: GameSystem = {
  id: 'enable_instant_gameplay_restart',
  order: 30,

  reset(state: GameState): void {
    const data = state.data as Record<string, any>;
    const restartState: RestartSystemState = data.enableInstantGameplayRestart || {
      lastPhase: 'ready',
      restartRequested: false,
    };
    restartState.lastPhase = state.phase;
    restartState.restartRequested = false;
    data.enableInstantGameplayRestart = restartState;
  },

  update(state: GameState, input: InputState, _dt: number): void {
    const data = state.data as Record<string, any>;
    const restartState: RestartSystemState = data.enableInstantGameplayRestart || {
      lastPhase: state.phase,
      restartRequested: false,
    };

    // Track session-based high score persistence across restarts
    if (typeof state.best !== 'number') {
      state.best = 0;
    }
    if (state.score > state.best) {
      state.best = state.score;
      data.sessionHighScore = state.best;
    } else if (data.sessionHighScore !== undefined && data.sessionHighScore > state.best) {
      state.best = data.sessionHighScore;
    }

    // Detect primary inputs (Spacebar, Click, Tap) when in 'over' or 'ready' phase
    const hasPrimaryInput =
      input.justPressed.has('Space') ||
      input.justPressed.has('KeyW') ||
      input.justPressed.has('ArrowUp') ||
      input.pointerJustDown;

    if (state.phase === 'over' && hasPrimaryInput && !restartState.restartRequested) {
      restartState.restartRequested = true;
      state.events.push('instant_restart_triggered');
      
      // Zero perceptible loading delay: immediately reset score and clear dynamic entities/obstacles
      state.score = 0;
      state.t = 0;
      state.entities = [];
      state.phase = 'playing';
      
      // Preserve session high score in state.data
      if (state.best > 0) {
        data.sessionHighScore = state.best;
      }
    }

    restartState.lastPhase = state.phase;
    data.enableInstantGameplayRestart = restartState;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (state.phase === 'over') {
      ctx.save();
      ctx.font = 'bold 16px Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      const cx = state.width / 2;
      const cy = state.height / 2 + 50;
      
      const data = state.data as Record<string, any>;
      const currentBest = Math.max(state.best, data.sessionHighScore || 0);
      
      ctx.fillText(`Session High Score: ${currentBest}`, cx, cy);
      ctx.restore();
    }
  },
};

export default system;