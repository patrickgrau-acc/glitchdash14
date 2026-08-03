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
    if (state.phase !== 'over') {
      return;
    }

    const message = state.data.gameOverMessage || "Skill issue";
    const centerX = state.width / 2;
    const centerY = state.height / 2;

    ctx.save();
    
    // High-contrast banner background for the message
    ctx.font = '900 24px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(message);
    const paddingX = 24;
    const paddingY = 16;
    const boxWidth = textMetrics.width + paddingX * 2;
    const boxHeight = 52;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - 65; // Positioned slightly above center/score area

    // Draw solid high-contrast background card with subtle rotation for meme energy
    ctx.translate(centerX, boxY + boxHeight / 2);
    ctx.rotate(-0.03); // Slight playful tilt
    ctx.translate(-centerX, -(boxY + boxHeight / 2));

    ctx.fillStyle = 'rgba(20, 20, 25, 0.92)';
    ctx.strokeStyle = 'oklch(0.55 0.18 320)'; // High contrast vibrant border
    ctx.lineWidth = 4;
    
    // Rounded rectangle path
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(boxX + r, boxY);
    ctx.lineTo(boxX + boxWidth - r, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + r);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - r);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - r, boxY + boxHeight);
    ctx.lineTo(boxX + r, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - r);
    ctx.lineTo(boxX, boxY + r);
    ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();

    // Draw bold, high-contrast text with shadow for maximum legibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(message, centerX, boxY + boxHeight / 2);

    ctx.restore();
  }
}

export default new DisplayIrreverentGameOver();