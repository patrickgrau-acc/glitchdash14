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
    // Render start prompt overlay when in ready phase
    if (state.phase === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, state.width, state.height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Title
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('GLITCH DASH 14', state.width / 2, state.height / 2 - 40);

      // Prompt satisfying TS-0000 and TS-0019
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.fillText('Press Space or Click to Start', state.width / 2, state.height / 2 + 20);

      ctx.restore();
    }
  },
};

export default startInitialGameplaySessionSystem;