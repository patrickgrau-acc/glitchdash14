// Implements: SPEC-042 (implicit vertical dodge mechanics), TS-0011, TS-0016, TS-0021
// Satisfies: Vertical dodge input processing and responsive character movement for Up and Down arrow keys.

import { GameSystem, GameState, InputState } from '../types';

/**
 * System that enables vertical dodge input (Up and Down arrow keys or W/S keys)
 * for the Glitch character, allowing responsive vertical evasion maneuvers
 * while preserving core movement and game loop consistency.
 */
const enableVerticalDodgeInputSystem: GameSystem = {
  id: 'enable_vertical_dodge_input',
  order: 15,

  reset(state: GameState): void {
    state.data.verticalDodge = {
      offsetY: 0,
      targetOffsetY: 0,
      dodgeTimer: 0,
      lastDirection: 0,
    };
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') return;

    if (!state.data.verticalDodge) {
      state.data.verticalDodge = {
        offsetY: 0,
        targetOffsetY: 0,
        dodgeTimer: 0,
        lastDirection: 0,
      };
    }

    const dodge = state.data.verticalDodge;

    // Check for Up arrow or KeyW for upward dodge
    const upPressed = input.justPressed.has('ArrowUp') || input.justPressed.has('KeyW');
    // Check for Down arrow or KeyS for downward dodge
    const downPressed = input.justPressed.has('ArrowDown') || input.justPressed.has('KeyS');

    const dodgeDistance = 45; // Pixels to shift vertically for a dodge maneuver
    const dodgeDuration = 0.25; // Duration of dodge transition in seconds

    if (upPressed) {
      dodge.targetOffsetY = -dodgeDistance;
      dodge.dodgeTimer = dodgeDuration;
      dodge.lastDirection = -1;
      state.events.push('vertical_dodge_up');
    } else if (downPressed) {
      dodge.targetOffsetY = dodgeDistance;
      dodge.dodgeTimer = dodgeDuration;
      dodge.lastDirection = 1;
      state.events.push('vertical_dodge_down');
    }

    // Smoothly interpolate offsetY toward targetOffsetY or return to 0
    if (dodge.dodgeTimer > 0) {
      dodge.dodgeTimer -= dt;
      if (dodge.dodgeTimer <= 0) {
        dodge.targetOffsetY = 0;
      }
    }

    // Lerp current offsetY toward targetOffsetY for fluid motion consistency
    const lerpSpeed = 15;
    dodge.offsetY += (dodge.targetOffsetY - dodge.offsetY) * Math.min(1, lerpSpeed * dt);

    // Apply vertical offset directly to player entities found in state.entities
    for (const ent of state.entities) {
      if (ent.kind === 'player' || ent.kind === 'runner') {
        // Store baseY if not present
        if (ent.baseY === undefined) {
          ent.baseY = ent.y;
        }
        ent.y = ent.baseY + dodge.offsetY;
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Optional subtle visual cue or particle effect for active dodge state
    const dodge = state.data.verticalDodge;
    if (dodge && Math.abs(dodge.offsetY) > 2 && state.phase === 'playing') {
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      // Render visual indicator or trail effect if desired
      ctx.restore();
    }
  },
};

export default enableVerticalDodgeInputSystem;