// Implements: SPEC-042, SPEC-043 (implied for meme-inspired game over feedback)
// Satisfies: TS-0080, TS-0081
import { GameSystem, GameState, InputState } from '../types';

/**
 * DisplayIrreverentGameOver manages cheeky, school-appropriate, meme-inspired
 * game-over messages when the player collides with an obstacle. It tracks the
 * current active cheeky message in state.data.gameOverMessage and renders it
 * with bold, high-contrast, irreverent typography on the Game Over screen.
 */
class DisplayIrreverentGameOver implements GameSystem {
  id = 'display_irreverent_game_over';
  order = 50;

  private cheekyMessages: string[] = [
    "Skill issue",
    "Bro really hit a wall",
    "Not the vibe, try again",
    "Physics: 1, You: 0",
    "That obstacle had right of way",
    "Certified gamer moment",
    "Lag? Let's go with lag.",
    "Oof size: Large",
    "Straight into the mainframe",
    "Absolute cinema of a crash"
  ];

  reset(state: GameState): void {
    state.data.gameOverMessage = undefined;
    state.data.lastPhase = state.phase;
  }

  update(state: GameState, input: InputState, dt: number): void {
    const prevPhase = state.data.lastPhase || 'ready';
    
    // When transitioning into 'over' phase, select a random safe cheeky message
    if (state.phase === 'over' && prevPhase !== 'over') {
      const randomIndex = Math.floor(Math.random() * this.cheekyMessages.length);
      state.data.gameOverMessage = this.cheekyMessages[randomIndex];
    }

    // Also check if state.events contains 'over' or 'hit' if phase transition missed it
    if (!state.data.gameOverMessage && (state.events.includes('over') || state.events.includes('hit') || state.phase === 'over')) {
      const randomIndex = Math.floor(Math.random() * this.cheekyMessages.length);
      state.data.gameOverMessage = this.cheekyMessages[randomIndex];
    }

    state.data.lastPhase = state.phase;
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Game-over panel is owned by calculate_display_final_session.ts — this system's
    // own centered card was stacking on top of it (and 2 other systems' panels) at the
    // exact moment a fast-retry arcade game most needs a clean, single message.
  }
}

export default new DisplayIrreverentGameOver();