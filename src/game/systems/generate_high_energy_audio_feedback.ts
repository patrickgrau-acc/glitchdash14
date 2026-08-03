// Implements: 4XEtTFUgKLkB1R3EmdjP (Generate High-Energy Audio Feedback)
// Satisfies: TS-0077 (mute toggle functionality), TS-0078 (audio feedback triggers)

import { GameSystem, GameState, InputState } from '../types';

/**
 * Generates high-energy arcade audio feedback using the browser's Web Audio API.
 * Reacts to game events ('jump', 'score', 'hit', 'over') and respects mute state
 * stored in state.data.audio.muted or toggleable via the 'KeyM' key.
 */
class GenerateHighEnergyAudioFeedback implements GameSystem {
  id = 'generate_high_energy_audio_feedback';
  order = 50;

  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  reset(state: GameState): void {
    if (!state.data.audio) {
      state.data.audio = { muted: false };
    }
  }

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure audio state exists
    if (!state.data.audio) {
      state.data.audio = { muted: false };
    }

    // Mute toggling is owned by manage_game_audio_controls.ts — this system only
    // reads the shared muted flag to decide whether to play sound effects.
    if (state.data.audio.muted) {
      return; // All audio feedback silenced when muted
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Consume events emitted by base_player / game loop
    for (const event of state.events) {
      if (event === 'jump') {
        this.playJumpSound(ctx);
      } else if (event === 'cleared') {
        // Only plays when an obstacle is actually jumped over — was firing on
        // every continuous score tick (base_player scores by survival time,
        // not per-obstacle), regardless of whether anything was jumped.
        this.playScoreSound(ctx);
      } else if (event === 'hit' || event === 'over') {
        this.playDeathSound(ctx);
      }
    }
  }

  private playJumpSound(ctx: AudioContext): void {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // Ignore audio context errors if browser blocks autoplay
    }
  }

  private playScoreSound(ctx: AudioContext): void {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  private playDeathSound(ctx: AudioContext): void {
    try {
      const now = ctx.currentTime;
      
      // Noise / Digital Glitch Fail sound
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      filter.Q.value = 4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);

      // Low drop oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Mute badge is owned by manage_game_audio_controls.ts (avoids a 3rd duplicate widget).
  }
}

export default new GenerateHighEnergyAudioFeedback();