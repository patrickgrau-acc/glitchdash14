/**
 * Implements: SPEC-032, SPEC-033
 * Satisfies: TS-0032, TS-0033
 * UC: Map Unified Input Events to Game Actions (TCGoEAsFc3nEuLzVh7vX)
 * Feature: Implement simple, responsive one-button input mechanics for desktop and mobile devices.
 */

import { GameSystem, GameState, InputState } from '../types';

interface InputMapState {
  lastActionTime: number;
  tapCount: number;
  inputActive: boolean;
}

const mapUnifiedInputEventsGame: GameSystem = {
  id: 'map_unified_input_events_game',
  order: 5,

  reset(state: GameState): void {
    state.data.inputMap = {
      lastActionTime: 0,
      tapCount: 0,
      inputActive: false,
    } as InputMapState;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.inputMap) {
      this.reset!(state);
    }

    const data = state.data.inputMap as InputMapState;
    data.inputActive = false;

    // Check for Spacebar or ArrowUp / KeyW for desktop jumping/actions
    const spacePressed = input.justPressed.has('Space') || input.justPressed.has('ArrowUp') || input.justPressed.has('KeyW');
    
    // Check for pointer / touch screen tap events
    const pointerTriggered = input.pointerJustDown;

    if (state.phase === 'playing' && (spacePressed || pointerTriggered)) {
      data.inputActive = true;
      data.lastActionTime = state.t;
      data.tapCount += 1;

      // Broadcast jump action event through shared state.events channel so base_player and other systems react immediately
      if (!state.events.includes('jump')) {
        state.events.push('jump');
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Input mapping relies on state.events and base_player for rendering the player character's response.
    // We optionally keep a subtle indicator in state.data for telemetry or debugging if needed.
    const data = state.data.inputMap as InputMapState;
    if (data && data.inputActive) {
      // Input flash/feedback handled via the event channel and base_player
    }
  }
};

export default mapUnifiedInputEventsGame;