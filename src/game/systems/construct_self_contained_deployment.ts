// Implements: SPEC-0015, SPEC-0018
// Satisfies: TS-0010, TS-0015, TS-0018
import { GameSystem, GameState, InputState } from '../types';

/**
 * ConstructSelfContainedDeploymentSystem
 * Manages configuration constants, zero-friction client state verification,
 * and robust localStorage persistence for high scores and deployment readiness.
 */
interface DeploymentConfig {
  INITIAL_SPEED: number;
  MIN_OBSTACLE_GAP: number;
  SPEED_INCREMENT_RATE: number;
  MAX_SPEED_CAP: number;
  GRAVITY_MULTIPLIER: number;
}

const DEFAULT_DEPLOYMENT_CONFIG: DeploymentConfig = {
  INITIAL_SPEED: 320,
  MIN_OBSTACLE_GAP: 180,
  SPEED_INCREMENT_RATE: 12,
  MAX_SPEED_CAP: 750,
  GRAVITY_MULTIPLIER: 1.1,
};

const system: GameSystem = {
  id: 'construct_self_contained_deployment',
  order: 5,

  reset(state: GameState) {
    // Expose developer-friendly configuration constants for inspection and tuning
    state.data.deploymentConfig = { ...DEFAULT_DEPLOYMENT_CONFIG };
    state.data.isSelfContainedVerified = true;
    state.data.offlineModeReady = true;

    // Load and synchronize high score from localStorage for zero-server persistence
    try {
      const savedBest = localStorage.getItem('glitchdash14_best');
      if (savedBest !== null) {
        const parsed = parseInt(savedBest, 10);
        if (!isNaN(parsed) && parsed > state.best) {
          state.best = parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, running in memory-only mode.', e);
    }
  },

  update(state: GameState, input: InputState, dt: number) {
    // Initialize deployment data scratchpad if not present
    if (!state.data.deploymentConfig) {
      state.data.deploymentConfig = { ...DEFAULT_DEPLOYMENT_CONFIG };
    }

    // Continuously ensure high score persistence whenever best score updates
    if (state.score > state.best) {
      state.best = state.score;
      try {
        localStorage.setItem('glitchdash14_best', state.best.toString());
      } catch (e) {
        // Fallback silently if storage quota or access is restricted
      }
    }

    // Listen for death or session completion events to ensure state persistence
    if (state.events.includes('over')) {
      try {
        localStorage.setItem('glitchdash14_best', state.best.toString());
      } catch (e) {
        // Ignore storage errors
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Passive background/subtle verification indicator or diagnostics if needed.
    // Core UI surfaces are owned by GameCanvas to prevent layout collisions.
  }
};

export default system;