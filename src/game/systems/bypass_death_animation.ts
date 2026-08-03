// Implements: SPEC-053
// Satisfies: TS-0112, TS-0114
import { GameSystem, GameState, InputState } from '../types';

/**
 * BypassDeathAnimationSystem allows players to instantly terminate the death
 * animation upon collision by pressing Jump (Space, Click, Tap, ArrowUp)
 * and transition directly to the Game Over state while preserving and saving score data.
 */
class BypassDeathAnimationSystem implements GameSystem {
  id = 'bypass_death_animation';
  order = 35;

  reset(state: GameState): void {
    state.data.deathBypassed = false;
    state.data.deathAnimationTimer = 0;
  }

  update(state: GameState, input: InputState, dt: number): void {
    // If we just hit an obstacle or entered over state / death sequence
    const hitOccurred = state.events.includes('hit') || state.events.includes('over');

    if (hitOccurred && state.phase === 'playing') {
      // Initialize death timer tracking
      if (!state.data.deathAnimationTimer) {
        state.data.deathAnimationTimer = 0;
        state.data.deathBypassed = false;
      }
    }

    // Check if death animation is active / playing out
    if (state.data.deathAnimationTimer !== undefined && state.data.deathAnimationTimer >= 0 && state.phase === 'playing') {
      state.data.deathAnimationTimer += dt;

      // Check if user provides immediate input to bypass death animation (Spacebar, pointer click/tap, KeyW, ArrowUp)
      const bypassTriggered =
        input.justPressed.has('Space') ||
        input.justPressed.has('ArrowUp') ||
        input.justPressed.has('KeyW') ||
        input.pointerJustDown;

      // Also allow if player holds Space/Click during death sequence for immediate response
      const bypassHeld =
        input.keys.has('Space') ||
        input.keys.has('ArrowUp') ||
        input.keys.has('KeyW') ||
        input.pointer.down;

      // If user triggers bypass, instantly terminate death sequence and transition to 'over'
      if (bypassTriggered || (bypassHeld && state.data.deathAnimationTimer > 0.05)) {
        state.data.deathBypassed = true;
        state.data.deathAnimationTimer = -1;

        // Ensure score data integrity is locked and persisted before transitioning
        const finalScore = Math.floor(state.score);
        state.data.finalScoreBypassed = finalScore;
        
        // Push event for tracking
        if (!state.events.includes('death_bypassed')) {
          state.events.push('death_bypassed');
        }

        // Force transition to over phase immediately, bypassing any lengthy animation
        state.phase = 'over';
        if (!state.events.includes('over')) {
          state.events.push('over');
        }

        // Persist score to local session storage to guarantee TS-0114 data integrity
        try {
          const currentBest = Number(localStorage.getItem('glitchdash_best') || '0');
          if (finalScore > currentBest) {
            localStorage.setItem('glitchdash_best', String(finalScore));
          }
          localStorage.setItem('glitchdash_last_score', String(finalScore));
        } catch {
          // Fallback if storage unavailable
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    /* removed by render-ownership gate: duplicate full_backdrop for phase 'playing', already owned by src/game/systems/monitor_performance_for_fairness.ts */
  }
}

export default new BypassDeathAnimationSystem();