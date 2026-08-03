// Implements: SPEC-Yyo03oo94nLakqBtptWU
// Satisfies: TS-0001, TS-0005
import { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Input Mapping system for GlitchDash14.
 * Maps physical input events (Spacebar, mouse/trackpad clicks, touch screen taps)
 * into a unified game action (jump/flap) to ensure responsive cross-device controls
 * across desktop (Chromebook), mobile, and tablet devices.
 */
const configureInputMappingSystem: GameSystem = {
  id: 'configure_input_mapping',
  order: 5,

  reset(state: GameState): void {
    state.data.inputConfig = {
      lastInputType: undefined,
      jumpTriggered: false,
      activeInputsCount: 0,
    };
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.inputConfig) {
      state.data.inputConfig = {
        lastInputType: undefined,
        jumpTriggered: false,
        activeInputsCount: 0,
      };
    }

    let triggered = false;
    let inputType = '';

    // Check keyboard spacebar or arrow up / key W
    if (input.justPressed.has('Space') || input.justPressed.has('ArrowUp') || input.justPressed.has('KeyW')) {
      triggered = true;
      inputType = 'keyboard';
    }

    // Check pointer (mouse click or touch screen tap)
    if (input.pointerJustDown) {
      triggered = true;
      inputType = 'pointer_or_touch';
    }

    if (triggered) {
      state.data.inputConfig.jumpTriggered = true;
      state.data.inputConfig.lastInputType = inputType;
      
      // Push event for other systems or audio/animation cues to consume
      if (!state.events.includes('input_jump')) {
        state.events.push('input_jump');
      }
    } else {
      state.data.inputConfig.jumpTriggered = false;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Input mapping is primarily logic and translation; UI prompts like 
    // "Press Space or Click to Start" or "Tap to Start" are owned by base_player/GameCanvas 
    // to avoid overlapping render surfaces. We optionally track debug/status in state.data.
  },
};

export default configureInputMappingSystem;