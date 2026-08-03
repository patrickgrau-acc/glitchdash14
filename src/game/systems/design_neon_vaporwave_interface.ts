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

    // The neon frame is already GameCanvas.tsx's own CSS border + glow on the
    // <canvas> element. This system was drawing a SECOND (and third) border
    // just inside it on ready/over — the "multiple nested boxes" look.
    state.data.neonPaletteActive = true;
  },
};

export default designNeonVaporwaveInterface;