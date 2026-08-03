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

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.audio) {
      state.data.audio = {
        muted: false,
        toggleRequested: false,
      };
    }

    const audioData = state.data.audio as AudioState;

    // Check if 'KeyM' was just pressed this frame
    const mPressed = input.justPressed.has('KeyM');

    // Also allow clicking a mute button area if tracked via pointer or events
    let clickedMute = false;
    if (input.pointerJustDown) {
      // Check if click is in top-right corner where mute toggle badge typically resides
      if (input.pointer.x >= state.width - 60 && input.pointer.y <= 60) {
        clickedMute = true;
      }
    }

    if (mPressed || clickedMute) {
      audioData.muted = !audioData.muted;
      audioData.toggleRequested = true;
      state.events.push(audioData.muted ? 'audio_muted' : 'audio_unmuted');

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(audioData.muted));
      } catch (e) {
        // Ignore storage write errors
      }
    } else {
      audioData.toggleRequested = false;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const audioData = state.data?.audio as AudioState | undefined;
    if (!audioData) return;

    // Draw minimalist persistent mute toggle indicator in top-right corner
    const x = state.width - 50;
    const y = 20;
    const w = 36;
    const h = 36;

    ctx.save();
    ctx.fillStyle = audioData.muted ? 'rgba(220, 38, 38, 0.85)' : 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(audioData.muted ? '🔇' : '🔊', x + w / 2, y + h / 2);
    ctx.restore();
  },
};

export default configureAudioMuteToggle;