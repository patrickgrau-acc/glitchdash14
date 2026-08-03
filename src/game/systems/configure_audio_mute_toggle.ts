// Implements: SPEC (Audio Mute Toggle Configuration & Persistence)
// Satisfies: TS-0002 (Persistent mute status across reloads), TS-0017 (Audio mute toggle functionality during active gameplay)

import { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Audio Mute Toggle system for GlitchDash14.
 * Manages persistent mute preference in localStorage, listens for 'KeyM' or pointer interaction,
 * and maintains audio state in state.data.audio.
 */
const STORAGE_KEY = 'glitchdash14_audio_muted';

interface AudioState {
  muted: boolean;
  toggleRequested: boolean;
}

const configureAudioMuteToggle: GameSystem = {
  id: 'configure_audio_mute_toggle',
  order: 15,

  reset(state: GameState): void {
    if (!state.data.audio) {
      let initialMuted = false;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          initialMuted = JSON.parse(stored);
        }
      } catch (e) {
        // Fallback if localStorage is restricted
        initialMuted = false;
      }

      state.data.audio = {
        muted: initialMuted,
        toggleRequested: false,
      } as AudioState;
    }
  },

  // Mute toggle handling and the audio badge are owned by manage_game_audio_controls.ts —
  // this system independently listening for the same KeyM press caused a triple-toggle
  // race (3 systems each re-flipping the same state.data.audio.muted flag per keypress).
  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.audio) {
      state.data.audio = {
        muted: false,
        toggleRequested: false,
      };
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {},
};

export default configureAudioMuteToggle;