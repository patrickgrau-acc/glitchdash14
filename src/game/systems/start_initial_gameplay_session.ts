// Implements: SPEC-KfX1eqBgyIX5csdoUAjY
// Satisfies: TS-0000, TS-0019
import { GameSystem, GameState, InputState } from '../types';

/**
 * Handles the initial gameplay session initiation mechanic.
 * Detects initial user input (Spacebar, Click, or Tap) while in the 'ready' phase
 * and triggers the start of the endless runner session by updating state.phase to 'playing',
 * initializing character animation states, and enabling environment scrolling.
 */
const startInitialGameplaySessionSystem: GameSystem = {
  id: 'start_initial_gameplay_session',
  order: 10,
  reset(state: GameState) {
    state.data.initialInputReceived = false;
    state.data.sessionStartTime = 0;
  },
  update(state: GameState, input: InputState, dt: number) {
    // Only act if we are in the 'ready' waiting state
    if (state.phase !== 'ready') {
      return;
    }

    // Check for initialization triggers: Spacebar, any key in justPressed, or pointer click/tap
    const spacePressed = input.justPressed.has('Space') || input.keys.has('Space');
    const anyKeyJustPressed = input.justPressed.size > 0;
    const clickedOrTapped = input.pointerJustDown || input.pointer.down;

    if (spacePressed || anyKeyJustPressed || clickedOrTapped) {
      state.phase = 'playing';
      state.data.initialInputReceived = true;
      state.data.sessionStartTime = state.t;
      state.events.push('session_started');
    }
  },
  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Ready-screen backdrop + title + start prompt are owned by GameCanvas.tsx's
    // DOM overlay (the "Ready?" panel with the START button) — this canvas-drawn
    // copy was stacking a second dark backdrop and a second "GLITCH DASH 14"
    // title underneath it every time the game was idle.
  },
};

export default startInitialGameplaySessionSystem;