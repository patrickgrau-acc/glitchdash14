// Implements: SPEC (Configure Game Parameters Live)
// Satisfies: TS-0113, TS-0115, TS-0117, TS-0118

import { GameSystem, GameState, InputState } from '@/game/types';

const SLIDER_STORAGE_KEYS = {
  speedModifier: 'glitchdash14_speed_modifier',
  gapSize: 'glitchdash14_gap_size',
  gravityMultiplier: 'glitchdash14_gravity_multiplier',
} as const;

function loadSlider(key: string): number | undefined {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return undefined;
    const parsed = parseFloat(stored);
    return isNaN(parsed) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

function saveSlider(key: string, val: number): void {
  try { localStorage.setItem(key, String(val)); } catch { /* ignore */ }
}

/**
 * ConfigureGameParametersLiveSystem
 * Satisfies TS-0113, TS-0115, TS-0117, TS-0118
 * Provides a live overlay (Shift + D) to adjust speed_modifier, gap_size, and gravity in real-time,
 * ensuring immediate application to spawned obstacles and level generation without pausing gameplay,
 * while isolating keyboard input (e.g. Spacebar) when the overlay is active.
 */
class ConfigureGameParametersLiveSystem implements GameSystem {
  id = 'configure_game_parameters_live';
  order = 45;

  // Tracks the last value seen for each slider so update() can detect when
  // GameCanvas.tsx's (locked) slider onChange writes a new one directly into
  // state.data, and persist it — that's the only way to notice the change,
  // since the slider UI never goes through this system's own input handling.
  private lastSeen: Record<string, number | undefined> = {
    speedModifier: undefined,
    gapSize: undefined,
    gravityMultiplier: undefined,
  };

  reset(state: GameState): void {
    // Restore the player's last slider values instead of hardcoding 1.0 — engine.ts's
    // startRun() wipes state.data on every restart, so without this the sliders'
    // underlying effect silently reverted to 1.00x every new game even though the
    // slider itself (separate React state in the locked GameCanvas.tsx) kept showing
    // wherever it was last dragged to.
    //
    // Unconditional, NOT `state.data.gravityMultiplier ?? ...` — configure_application_
    // parameters.ts (order 1) unconditionally sets state.data.gravityMultiplier to its own
    // fixed APP_CONFIG constant on every reset(), running before this system (order 45).
    // A `?? ` self-check here always found that non-undefined value already sitting there
    // and short-circuited, silently discarding the persisted slider value every time — the
    // gravity slider specifically, since speedModifier/gapSize don't share a field name
    // with anything else that writes on reset(). This system runs last among the writers,
    // so it should just assert the persisted value rather than defer to it.
    state.data.configOverlayOpen = false;
    state.data.speedModifier = loadSlider(SLIDER_STORAGE_KEYS.speedModifier) ?? 1.0;
    state.data.gapSize = loadSlider(SLIDER_STORAGE_KEYS.gapSize) ?? 1.0;
    state.data.gravityMultiplier = loadSlider(SLIDER_STORAGE_KEYS.gravityMultiplier) ?? 1.0;
    this.lastSeen.speedModifier = state.data.speedModifier;
    this.lastSeen.gapSize = state.data.gapSize;
    this.lastSeen.gravityMultiplier = state.data.gravityMultiplier;
  }

  update(state: GameState, input: InputState, dt: number): void {
    // The on-canvas Shift+D overlay and its input-isolation are gone — live config
    // is now real HTML range inputs in the DOM status panel (GameCanvas.tsx), which
    // write directly to state.data.speedModifier/gapSize/gravityMultiplier and
    // don't compete with canvas input at all.
    state.data.speed_modifier = state.data.speedModifier;
    state.data.gap_size = state.data.gapSize;

    for (const key of Object.keys(SLIDER_STORAGE_KEYS) as (keyof typeof SLIDER_STORAGE_KEYS)[]) {
      const current = state.data[key];
      if (typeof current === 'number' && current !== this.lastSeen[key]) {
        this.lastSeen[key] = current;
        saveSlider(SLIDER_STORAGE_KEYS[key], current);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Live config UI moved to the DOM status panel outside the canvas.
  }
}

export default new ConfigureGameParametersLiveSystem();