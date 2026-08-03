// Implements: SPEC-092, SPEC-093, SPEC-103
// Satisfies: TS-0092, TS-0093, TS-0103

import { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Input Listener for Session Restart
 * Handles user input during 'over' phase to trigger immediate restart (Spacebar, Click, or Tap),
 * while ensuring active gameplay ('playing') inputs are reserved for primary mechanics only.
 */
const configureInputListenerSession: GameSystem = {
  id: 'configure_input_listener_session',
  order: 95,

  reset(state: GameState): void {
    state.data.restartTriggered = false;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase === 'over') {
      const spacePressed = input.justPressed.has('Space');
      const clickOrTap = input.pointerJustDown;

      if (spacePressed || clickOrTap) {
        state.data.restartTriggered = true;
        state.events.push('restart_requested');
      }
    } else {
      // In active gameplay, ensure no accidental restart flags
      state.data.restartTriggered = false;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Session restart UI feedback if needed; core retry button is handled by GameCanvas.
  }
};

export default configureInputListenerSession;