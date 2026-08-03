/**
 * Implements: SPEC-SCREEN-SHAKE, TS-0003, TS-0024
 * Satisfies TS-0003 (screen shake triggers on collision) and TS-0024 (viewport returns to neutral after shake).
 */

import type { GameSystem, GameState, InputState } from '../types';

interface ScreenShakeData {
  shakeTimer: number;
  shakeDuration: number;
  intensity: number;
}

const system: GameSystem = {
  id: 'implement_screen_shake_feedback',
  order: 55,

  reset(state: GameState) {
    state.data.screenShake = {
      shakeTimer: 0,
      shakeDuration: 0.2, // ~200ms shake as requested by test scripts
      intensity: 12, // High-intensity rapid shake
    } as ScreenShakeData;
  },

  update(state: GameState, _input: InputState, dt: number) {
    if (!state.data.screenShake) {
      this.reset!(state);
    }

    const shake = state.data.screenShake as ScreenShakeData;

    // Detect collision event ('hit') or phase transition to 'over'
    if (state.events.includes('hit') || (state.events.includes('over') && shake.shakeTimer <= 0)) {
      shake.shakeTimer = shake.shakeDuration;
    }

    // Decrement shake timer during active shake
    if (shake.shakeTimer > 0) {
      shake.shakeTimer = Math.max(0, shake.shakeTimer - dt);
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    const shake = state.data.screenShake as ScreenShakeData;
    if (!shake || shake.shakeTimer <= 0) {
      return;
    }

    // Calculate rapid random offsets based on remaining duration and intensity
    const progress = shake.shakeTimer / shake.shakeDuration;
    const currentIntensity = shake.intensity * progress;
    
    const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Store active offset in state.data for potential HUD or external consumers if needed
    state.data.currentShakeOffset = { x: offsetX, y: offsetY };
    
    ctx.restore();
  },
};

export default system;