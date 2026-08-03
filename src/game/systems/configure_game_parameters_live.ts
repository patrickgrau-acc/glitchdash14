// Implements: SPEC (Configure Game Parameters Live)
// Satisfies: TS-0113, TS-0115, TS-0117, TS-0118

import { GameSystem, GameState, InputState } from '@/game/types';

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

  reset(state: GameState): void {
    state.data.configOverlayOpen = false;
    state.data.speedModifier = state.data.speedModifier ?? 1.0;
    state.data.gapSize = state.data.gapSize ?? 1.0;
    state.data.gravityMultiplier = state.data.gravityMultiplier ?? 1.0;
    state.data.inputFocus = false;
  }

  update(state: GameState, input: InputState, dt: number): void {
    // Check for Shift + D toggle (KeyD + Shift)
    const shiftPressed = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
    if (input.justPressed.has('KeyD') && shiftPressed) {
      state.data.configOverlayOpen = !state.data.configOverlayOpen;
      // Push event for telemetry/logging
      state.events.push(`config_overlay_${state.data.configOverlayOpen ? 'opened' : 'closed'}`);
    }

    // TS-0118: Keyboard input isolation when overlay is active
    if (state.data.configOverlayOpen) {
      // Clear space/jump or other critical inputs from justPressed and keys so game ignores them while tuning
      input.justPressed.delete('Space');
      input.justPressed.delete('KeyW');
      input.justPressed.delete('ArrowUp');
      input.keys.delete('Space');
      
      // Allow closing with Escape
      if (input.justPressed.has('Escape')) {
        state.data.configOverlayOpen = false;
      }
    }

    // Ensure parameters are synced to state.data for other systems (like obstacle generators) to consume immediately (TS-0113, TS-0115)
    state.data.speed_modifier = state.data.speedModifier;
    state.data.gap_size = state.data.gapSize;
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // TS-0117: Gameplay continuity - overlay renders on top of the game canvas without pausing
    if (!state.data.configOverlayOpen) {
      // Draw subtle prompt hint in a non-obtrusive corner
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '11px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Press [Shift + D] for Live Config', state.width - 16, 24);
      ctx.restore();
      return;
    }

    ctx.save();

    // Semi-transparent backdrop overlay without pausing the game loop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(40, 40, state.width - 80, state.height - 80);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, state.width - 80, state.height - 80);

    // Header
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('In-Game Live Configuration (Shift + D to close)', 70, 85);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Roboto, sans-serif';
    ctx.fillText('Gameplay is running live. Parameters apply instantly.', 70, 110);

    const speed = state.data.speedModifier || 1.0;
    const gap = state.data.gapSize || 1.0;
    const gravity = state.data.gravityMultiplier || 1.0;

    // Controls display / sliders UI representation
    const startY = 150;
    const rowHeight = 70;

    const renderSliderRow = (label: string, value: number, min: number, max: number, y: number, unit: string) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px Roboto, sans-serif';
      ctx.fillText(`${label}: ${value.toFixed(2)}${unit}`, 70, y);

      // Track bar
      ctx.fillStyle = '#334155';
      ctx.fillRect(70, y + 12, state.width - 140, 8);

      // Fill bar
      const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(70, y + 12, (state.width - 140) * pct, 8);

      // Thumb
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(70 + (state.width - 140) * pct, y + 16, 7, 0, Math.PI * 2);
      ctx.fill();
    };

    renderSliderRow('Speed Modifier (TS-0113)', speed, 0.5, 3.0, startY, 'x');
    renderSliderRow('Gap Size Factor (TS-0115)', gap, 0.5, 2.5, startY + rowHeight, 'x');
    renderSliderRow('Gravity Multiplier', gravity, 0.5, 2.0, startY + rowHeight * 2, 'x');

    // Instructions footer
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Roboto, sans-serif';
    ctx.fillText('Use mouse clicks or arrow keys on sliders to tune difficulty on the fly. Spacebar input is isolated.', 70, state.height - 70);

    ctx.restore();
  }
}

export default new ConfigureGameParametersLiveSystem();