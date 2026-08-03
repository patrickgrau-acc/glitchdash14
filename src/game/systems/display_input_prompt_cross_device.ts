// Implements: FjOF8pNLLKqCHvZYrJE6
// Satisfies: TS-0028, TS-0035, TS-0039

import { GameSystem, GameState, InputState } from '../types';

/**
 * Display Input Prompt for Cross-Device Orientation system.
 * Computes and exposes the correct device-appropriate prompt text ('Press Space or Click to Start'
 * for desktop vs 'Tap to Start' for mobile) in state.data.inputPromptText, and handles instant
 * session initiation upon user interaction during the 'ready' or 'over' phase.
 */
const displayInputPromptCrossDevice: GameSystem = {
  id: 'display_input_prompt_cross_device',
  order: 20,

  reset(state: GameState): void {
    state.data.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
    state.data.inputPromptText = state.data.isMobileDevice
      ? 'Tap to Start'
      : 'Press Space or Click to Start';
    state.data.promptInteractionTriggered = false;
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure initial state fields exist
    if (typeof state.data.isMobileDevice === 'undefined') {
      state.data.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );
    }
    
    // Update prompt text based on device detection
    state.data.inputPromptText = state.data.isMobileDevice
      ? 'Tap to Start'
      : 'Press Space or Click to Start';

    // When in ready or over phase, check for user interaction to initiate session immediately
    if (state.phase === 'ready' || state.phase === 'over') {
      const spacePressed = input.justPressed.has('Space') || input.justPressed.has('KeyW') || input.justPressed.has('ArrowUp');
      const pointerClicked = input.pointerJustDown;

      if (spacePressed || pointerClicked) {
        state.data.promptInteractionTriggered = true;
        if (!state.events.includes('start_session')) {
          state.events.push('start_session');
        }
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // GameCanvas.tsx owns the primary prompt text rendering for ready/over screens,
    // but we ensure state.data.inputPromptText is correctly exposed and updated each frame
    // so the engine HUD reads the correct localized/device prompt.
  }
};

export default displayInputPromptCrossDevice;