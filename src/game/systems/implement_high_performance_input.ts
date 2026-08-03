// Implements: SPEC-FfA8swwP0SQanzoNyKUJ
// Satisfies: TS-0038, TS-0041, TS-0044
import { GameSystem, GameState, InputState } from '../types';

/**
 * Implements high-performance input event processing and responsiveness
 * for jump and action triggers via Spacebar and Pointerdown.
 * Decouples input state tracking from the main rendering thread and ensures
 * proper input clearance upon Game Over transitions to prevent accidental restarts.
 */
const implementHighPerformanceInput: GameSystem = {
  id: 'implement_high_performance_input',
  order: 10,

  reset(state: GameState): void {
    // Clear any residual input buffering state upon session start/restart
    state.data.inputBuffered = false;
    state.data.lastInputTimestamp = 0;
    state.data.actionPressed = false;
  },

  update(state: GameState, input: InputState, dt: number): void {
    // If the game has transitioned to 'over', clear any held states to prevent accidental immediate restart
    if (state.phase === 'over') {
      state.data.actionPressed = false;
      state.data.inputBuffered = false;
      return;
    }

    // Check for responsiveness on Spacebar or pointer down (one-button input mechanics)
    const spaceJustPressed = input.justPressed.has('Space');
    const spaceHeld = input.keys.has('Space');
    const pointerTriggered = input.pointerJustDown || input.pointer.down;

    if (spaceJustPressed || pointerTriggered || spaceHeld) {
      state.data.actionPressed = true;
      state.data.inputBuffered = true;
      state.data.lastInputTimestamp = state.t;

      // Ensure appropriate event emission so core gameplay loop picks up the action
      if (spaceJustPressed || input.pointerJustDown) {
        if (!state.events.includes('jump') && !state.events.includes('action')) {
          state.events.push('jump');
        }
      }
    } else {
      state.data.actionPressed = false;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Input system is decoupled and handles state tracking without rendering duplicated overlays.
    // Exposes current input status for debugging / fairness monitoring if required.
    state.data.highPerformanceInputActive = true;
  },
};

export default implementHighPerformanceInput;