// Implements: SPEC-0083
// Satisfies: TS-0083 (mute toggle functionality, audio silence/restore, mute state persistence across restarts)

import type { GameSystem, GameState, InputState } from '../types';

/**
 * Manages game audio controls, providing a persistent mute toggle for classroom/school environments,
 * silencing/restoring audio output, and persisting mute state across session restarts.
 */
interface AudioControlData {
  muted: boolean;
  previousVolume: number;
  lastToggleTime: number;
  /** Seconds remaining to show the badge after a toggle; badge is hidden at 0 */
  badgeShowTimer: number;
}

const AUDIO_STORAGE_KEY = 'glitchdash14_audio_muted';

const manageGameAudioControlsSystem: GameSystem = {
  id: 'manage_game_audio_controls',
  order: 30,

  reset(state: GameState): void {
    // Read persisted mute state from localStorage if available, defaulting to false (audio enabled by default)
    let persistedMuted = false;
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (stored !== null) {
        persistedMuted = stored === 'true';
      }
    } catch {
      // Fallback if localStorage is unavailable
    }

    state.data.audio = {
      muted: persistedMuted,
      previousVolume: 1.0,
      lastToggleTime: 0,
      badgeShowTimer: 0,
      audioContextSupported: typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext) !== undefined
    } as AudioControlData;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.audio) {
      this.reset!(state);
    }

    const audioData = state.data.audio as AudioControlData;

    // Sole owner of the mute toggle (was previously duplicated across 3 systems,
    // each reading the same KeyM press and re-toggling the same flag).
    const mPressed = input.justPressed.has('KeyM');
    const toggleEventRequested = state.events.includes('toggle_mute');

    if (mPressed || toggleEventRequested) {
      const now = Date.now();
      // Debounce rapid toggle clicks (minimum 250ms interval)
      if (now - audioData.lastToggleTime > 250) {
        audioData.lastToggleTime = now;
        audioData.muted = !audioData.muted;
        audioData.badgeShowTimer = 2.0; // reveal the badge for 2s, then it fades from view

        // Persist mute state to localStorage to ensure it survives session restarts
        try {
          localStorage.setItem(AUDIO_STORAGE_KEY, String(audioData.muted));
        } catch {
          // Ignore write errors
        }

        // Push event to notify other audio/sound effect systems
        state.events.push(audioData.muted ? 'audio_muted' : 'audio_restored');
      }
    }

    if (audioData.badgeShowTimer > 0) {
      audioData.badgeShowTimer = Math.max(0, audioData.badgeShowTimer - dt);
    }

    // Apply mute state to any active HTML audio elements or Web Audio API nodes in the document
    try {
      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach((el) => {
        (el as HTMLMediaElement).muted = audioData.muted;
      });
    } catch {
      // Ignore DOM querying errors in headless test runners
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const audioData = state.data.audio as AudioControlData;
    if (!audioData || !audioData.badgeShowTimer) return;

    // Only visible for a couple seconds right after pressing 'M' — not a permanent HUD fixture.
    const padding = 16;
    const x = state.width - 52 - padding;
    const y = padding;
    const w = 52;
    const h = 32;

    ctx.save();
    ctx.globalAlpha = Math.min(1, audioData.badgeShowTimer / 0.4);

    // Background pill
    ctx.fillStyle = audioData.muted ? 'rgba(239, 68, 68, 0.85)' : 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = audioData.muted ? 'rgba(248, 113, 113, 1)' : 'rgba(71, 85, 105, 1)';
    ctx.lineWidth = 1.5;

    // Rounded rect helper
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Icon & Label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const iconLabel = audioData.muted ? 'MUTE' : 'AUDIO';
    ctx.fillText(iconLabel, x + w / 2, y + h / 2);

    ctx.restore();
  }
};

export default manageGameAudioControlsSystem;