// Implements: SPEC-tgkne6osK1WBh2mTb8ep
// Satisfies: TS-0119, TS-0120
import type { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Feedback Sequence Duration system.
 * Controls death feedback animation timing, ensuring feedback sequences complete
 * within the 500ms - 1000ms window (Hard Cap: 1000ms) without technical lag.
 */
export const DEATH_ANIMATION_DURATION = 750; // Milliseconds, tunable between 500ms and 1000ms

interface DeathFeedbackState {
  isAnimatingDeath: boolean;
  deathTimer: number;
  duration: number;
}

const configureFeedbackSequenceSystem: GameSystem = {
  id: 'configure_feedback_sequence',
  order: 30,

  reset(state: GameState): void {
    state.data.deathFeedback = {
      isAnimatingDeath: false,
      deathTimer: 0,
      duration: DEATH_ANIMATION_DURATION,
    } as DeathFeedbackState;
  },

  update(state: GameState, _input: InputState, dt: number): void {
    if (!state.data.deathFeedback) {
      state.data.deathFeedback = {
        isAnimatingDeath: false,
        deathTimer: 0,
        duration: DEATH_ANIMATION_DURATION,
      } as DeathFeedbackState;
    }

    const feedback = state.data.deathFeedback as DeathFeedbackState;

    // Check if player just hit or entered 'over' phase from 'playing'
    if (state.phase === 'over' && !feedback.isAnimatingDeath && state.events.includes('hit')) {
      feedback.isAnimatingDeath = true;
      feedback.deathTimer = 0;
    }

    if (feedback.isAnimatingDeath) {
      feedback.deathTimer += dt * 1000; // convert seconds to ms
      if (feedback.deathTimer >= feedback.duration) {
        feedback.isAnimatingDeath = false;
        // Ensure reset loop is ready
      }
    }

    // Reset when ready phase starts
    if (state.phase === 'ready') {
      feedback.isAnimatingDeath = false;
      feedback.deathTimer = 0;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const feedback = state.data.deathFeedback as DeathFeedbackState;
    if (!feedback || !feedback.isAnimatingDeath) return;

    // Render a high-energy glitch/death feedback pulse overlay conforming to duration limits
    const progress = Math.min(1, feedback.deathTimer / feedback.duration);
    ctx.save();
    ctx.fillStyle = `rgba(255, 0, 85, ${0.3 * (1 - progress)})`;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.font = 'bold 24px Roboto, sans-serif';
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'center';
    ctx.fillText('GLITCH FATALITY // REBOOTING...', state.width / 2, state.height / 2 - 40);
    ctx.restore();
  }
};

export default configureFeedbackSequenceSystem;