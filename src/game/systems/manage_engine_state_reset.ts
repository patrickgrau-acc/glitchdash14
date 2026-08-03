// Implements: SPEC-090 (implicit engine/state reset mechanics)
// Satisfies: TS-0090 (Verify state reset and performance continuity after player death)
// Epic: Performance-Optimized Asset Management
// Use case: NsZ7XxhUbbs8C66WPDcM (Manage Engine State Reset)

import type { GameSystem, GameState } from '../types';

/**
 * Manages engine state reset, session continuity, score resetting, and performance consistency
 * across gameplay restarts without requiring component re-instantiation or full page reload.
 */
const system: GameSystem = {
  id: 'manage_engine_state_reset',
  order: 10,
  reset(state: GameState) {
    // Reset core engine state variables and session scratch variables on game restart
    state.score = 0;
    state.t = 0;
    state.entities = [];
    state.events = [];
    
    // Reset internal data tracking for speed, obstacles, and engine state
    state.data.speed = 360;
    state.data.scored = 0;
    state.data.hardCapReached = false;
    state.data.performanceWarning = false;
    state.data.restartCount = (state.data.restartCount || 0) + 1;
    state.data.lastResetTimestamp = performance.now();
  },
  update(state: GameState, _input, dt: number) {
    // Track runtime stability and engine performance continuity after reset
    if (state.phase === 'playing') {
      state.data.engineActiveTime = (state.data.engineActiveTime || 0) + dt;
    }
  },
  render(_ctx, _state) {
    // Core engine reset system coordinates state and session resets; 
    // rendering is handled by the primary game canvas and existing UI overlays.
  }
};

export default system;