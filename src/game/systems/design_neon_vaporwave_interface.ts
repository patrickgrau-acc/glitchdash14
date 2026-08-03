// Implements: SPEC-042 (High-energy meme-inspired UI)
// Satisfies: TS-0071, TS-0082
import { GameSystem, GameState, InputState } from '../types';

/**
 * DesignNeonVaporwaveInterfaceSystem
 * 
 * Provides high-contrast, neon-saturated vaporwave visual styling cues,
 * typography effects, neon glowing overlays, and high-energy arcade aesthetics
 * suitable for school-setting arcade play without cluttering core game loop text.
 */
interface NeonVaporwaveState {
  pulseTimer: number;
  neonColors: {
    hotPink: string;
    electricBlue: string;
    limeGreen: string;
    sunsetOrange: string;
  };
}

const designNeonVaporwaveInterface: GameSystem = {
  id: 'design_neon_vaporwave_interface',
  order: 95,

  reset(state: GameState) {
    state.data.neonVaporwave = {
      pulseTimer: 0,
      neonColors: {
        hotPink: '#ff007f',
        electricBlue: '#00f0ff',
        limeGreen: '#39ff14',
        sunsetOrange: '#ff7700',
      },
    } as NeonVaporwaveState;
  },

  update(state: GameState, _input: InputState, dt: number) {
    if (!state.data.neonVaporwave) {
      this.reset!(state);
    }
    const nv = state.data.neonVaporwave as NeonVaporwaveState;
    nv.pulseTimer += dt * 3.5;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    if (!state.data.neonVaporwave) return;
    const nv = state.data.neonVaporwave as NeonVaporwaveState;

    ctx.save();

    // Subtle CRT scanlines and neon vignette framing
    const width = state.width || 800;
    const height = state.height || 450;

    // Draw cyberpunk neon framing borders depending on phase
    if (state.phase === 'ready' || state.phase === 'over') {
      const pulseAlpha = 0.15 + Math.sin(nv.pulseTimer) * 0.08;
      ctx.strokeStyle = nv.neonColors.hotPink;
      ctx.lineWidth = 4;
      ctx.shadowColor = nv.neonColors.hotPink;
      ctx.shadowBlur = 12;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      ctx.strokeStyle = nv.neonColors.electricBlue;
      ctx.lineWidth = 2;
      ctx.shadowColor = nv.neonColors.electricBlue;
      ctx.shadowBlur = 8;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      // Decorative cyberpunk grid accents in corners
      ctx.fillStyle = nv.neonColors.limeGreen;
      ctx.fillRect(12, 12, 16, 4);
      ctx.fillRect(12, 12, 4, 16);
      ctx.fillRect(width - 28, 12, 16, 4);
      ctx.fillRect(width - 16, 12, 4, 16);
    }

    // Expose computed palette & typography metrics for other systems/inspectors
    state.data.neonPaletteActive = true;

    ctx.restore();
  },
};

export default designNeonVaporwaveInterface;