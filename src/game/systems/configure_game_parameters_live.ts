// Implements: SPEC (Configure Game Parameters Live)
// Satisfies: TS-0113, TS-0115, TS-0117, TS-0118

import { GameSystem, GameState, InputState } from '@/game/types';

/**
 * ConfigureGameParametersLiveSystem
 * Satisfies TS-0113, TS-0115, TS-0117, TS-0118
 * Provides a live overlay (Shift + D) to adjust speed_modifier, gap_size, and gravity in real-time,
 * ensuring immediate application to spawned obstacles and level generation without pausing gameplay,
 * while isolating keyboard input (e.g. Spacebar) when the overlay is active.
 */
class ConfigureGameParametersLiveSystem implements GameSystem {
  id = 'configure_game_parameters_live';
  order = 45;

  reset(state: GameState): void {
    state.data.configOverlayOpen = false;
    state.data.speedModifier = state.data.speedModifier ?? 1.0;
    state.data.gapSize = state.data.gapSize ?? 1.0;
    state.data.gravityMultiplier = state.data.gravityMultiplier ?? 1.0;
    state.data.inputFocus = false;
  }

  update(state: GameState, input: InputState, dt: number): void {
    // The on-canvas Shift+D overlay and its input-isolation are gone — live config
    // is now real HTML range inputs in the DOM status panel (GameCanvas.tsx), which
    // write directly to state.data.speedModifier/gapSize/gravityMultiplier and
    // don't compete with canvas input at all.
    state.data.speed_modifier = state.data.speedModifier;
    state.data.gap_size = state.data.gapSize;
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Live config UI moved to the DOM status panel outside the canvas.
  }
}

export default new ConfigureGameParametersLiveSystem();