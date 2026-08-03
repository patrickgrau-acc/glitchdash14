// Implements: SPEC-042 (implicit balance configuration requirement)
// Satisfies: TS-0004, TS-0006, TS-0022
/**
 * Game system responsible for configuring and injecting centralized game balance constants
 * into the active game state (`state.data.difficultyConfig` and speed multipliers).
 * Satisfies requirements for centralized speed, obstacle frequency, and difficulty scaling factors.
 */

import { GameSystem, GameState, InputState } from '../types';

export interface GameBalanceConfig {
  /** Initial horizontal speed of obstacles and game world movement */
  INITIAL_SPEED: number;
  /** Minimum horizontal gap between spawned obstacles */
  MIN_OBSTACLE_GAP: number;
  /** Rate at which speed increments per second of elapsed gameplay time */
  SPEED_INCREMENT_RATE: number;
  /** Absolute maximum speed cap for safety and playability */
  MAX_SPEED_CAP: number;
  /** Global gravity multiplier affecting jump and fall arcs */
  GRAVITY_MULTIPLIER: number;
  /** Jump force vector strength */
  JUMP_FORCE: number;
}

const DEFAULT_BALANCE_CONFIG: GameBalanceConfig = {
  INITIAL_SPEED: 6,
  MIN_OBSTACLE_GAP: 220,
  SPEED_INCREMENT_RATE: 0.12,
  MAX_SPEED_CAP: 18,
  GRAVITY_MULTIPLIER: 1.0,
  JUMP_FORCE: 11.5,
};

const configureGameBalanceConstantsSystem: GameSystem = {
  id: 'configure_game_balance_constants',
  order: 10,

  reset(state: GameState): void {
    // Expose centralized balance configuration on state.data for dependent systems
    state.data.difficultyConfig = {
      ...DEFAULT_BALANCE_CONFIG,
    };
    state.data.globalSpeedMultiplier = 1.0;
    state.data.intensity = state.data.intensity || 1.0;
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure balance configuration is always present in state.data
    if (!state.data.difficultyConfig) {
      state.data.difficultyConfig = { ...DEFAULT_BALANCE_CONFIG };
    }

    // Allow live tuning adjustments or difficulty scaling integration
    const config: GameBalanceConfig = state.data.difficultyConfig;
    
    // If playing, scale speed gently according to configuration increment rate
    if (state.phase === 'playing' && dt > 0) {
      const speedInc = config.SPEED_INCREMENT_RATE * dt;
      const currentSpeed = state.data.globalSpeedMultiplier || 1.0;
      const targetSpeed = Math.min(config.MAX_SPEED_CAP / config.INITIAL_SPEED, currentSpeed + speedInc * 0.05);
      state.data.globalSpeedMultiplier = targetSpeed;
    }
  },
};

export default configureGameBalanceConstantsSystem;