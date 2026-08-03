// Implements: SPEC-TKld3kH1YMf9ZLIdquuF
// Satisfies: TS-0089, TS-0095, TS-0096
import { GameSystem, GameState, InputState } from '../types';

/**
 * Resets dynamic gameplay variables, flushes input buffers, clears ghost
 * collision maps, and recycles entity object pools via active flag toggling
 * to ensure zero memory churn during instant restarts.
 */
const resetGameplayStateContainerSystem: GameSystem = {
  id: 'reset_gameplay_state_container',
  order: 5,

  reset(state: GameState): void {
    // Reset core session metrics to initial t=0 values per TS-0095
    state.t = 0;
    state.score = 0;
    
    // Reset difficulty scaling factors and active timers stored in state.data
    state.data.intensity = 1.0;
    state.data.globalSpeedMultiplier = 1.0;
    state.data.obstacleGapFactor = 1.0;
    state.data.hardCapReached = false;
    state.data.difficultyConfig = state.data.difficultyConfig || {};
    state.data.difficultyConfig.INITIAL_SPEED = 300;
    
    // Flush input buffers and ghost references per TS-0089
    if (state.data.inputBuffer) {
      if (Array.isArray(state.data.inputBuffer)) {
        state.data.inputBuffer.length = 0;
      } else {
        state.data.inputBuffer = [];
      }
    }
    
    // Clear spatial collision map / grid if present
    if (state.data.spatialMap) {
      if (state.data.spatialMap instanceof Map) {
        state.data.spatialMap.clear();
      } else {
        state.data.spatialMap = {};
      }
    }

    // Memory-safe object pool reset via active flag toggling per TS-0096
    // Ensures zero dynamic memory allocation/deallocation (malloc/new) during reset.
    if (Array.isArray(state.entities)) {
      for (let i = 0; i < state.entities.length; i++) {
        const entity = state.entities[i];
        if (entity) {
          entity.active = false;
          entity.vx = 0;
          entity.vy = 0;
        }
      }
    }

    // Clear event queue for clean session start
    state.events = [];
    
    // Push restart event for downstream systems
    state.events.push('session_reset');
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Monitor for reset trigger signals or manual instant-retry key bindings (e.g. 'KeyR')
    if (input.justPressed.has('KeyR') && state.phase === 'over') {
      state.events.push('trigger_restart');
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Render transient restart transition flash or helper overlays if active
    if (state.data.resetFlashTimer && state.data.resetFlashTimer > 0) {
      state.data.resetFlashTimer -= 0.016;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, state.data.resetFlashTimer * 3)})`;
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.restore();
    }
  }
};

export default resetGameplayStateContainerSystem;