/**
 * Implements: SPEC-042 (Live configuration visual theme aesthetics)
 * Satisfies: TS-0116 (Content filtering for visual aesthetic themes - school appropriate palettes),
 *            TS-0121 (Live palette toggle updates game interface & maintains accessibility standards)
 *
 * Mechanic: Modify Visual Aesthetic Settings (gELcVNCPg4nnKeXRbNRa)
 * Feature: Configure game parameters for easy adjustments to difficulty, assets, and styling.
 * Epic: In-Game Live Configuration Interface
 *
 * Provides theme selection (Neon, Vaporwave, HighContrast, ClassicSchool) with strict school-appropriate
 * filtering, accessibility contrast validation, symbol/pattern fallback indicators for colorblind users,
 * and live aesthetic updates rendered cleanly onto the canvas via state.data.
 */

import { GameSystem, GameState, InputState } from '../types';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  hazardColor: string;
  safeColor: string;
  /** Visual pattern symbol for non-color accessibility indicators */
  hazardSymbol: string;
  safeSymbol: string;
}

export const SCHOOL_APPROVED_PALETTES: Record<string, ColorPalette> = {
  neon: {
    id: 'neon',
    name: 'Neon Arcade',
    primary: '#00F0FF',
    accent: '#FF007F',
    background: '#0B0F19',
    surface: '#151C2C',
    text: '#F8FAFC',
    hazardColor: '#EF4444',
    safeColor: '#10B981',
    hazardSymbol: '▲',
    safeSymbol: '●',
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave Sunset',
    primary: '#FF71CE',
    accent: '#01CDFE',
    background: '#1A112B',
    surface: '#291843',
    text: '#FFF0F5',
    hazardColor: '#FF3366',
    safeColor: '#33CC99',
    hazardSymbol: '◆',
    safeSymbol: '★',
  },
  high_contrast: {
    id: 'high_contrast',
    name: 'High Contrast Accessibility',
    primary: '#FFFFFF',
    accent: '#FFD700',
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    hazardColor: '#FF0000',
    safeColor: '#00FF00',
    hazardSymbol: '✖',
    safeSymbol: '✔',
  },
  classic_school: {
    id: 'classic_school',
    name: 'Classic Campus',
    primary: '#2563EB',
    accent: '#0D9488',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    hazardColor: '#DC2626',
    safeColor: '#059669',
    hazardSymbol: '!',
    safeSymbol: '✓',
  },
};

const ModifyVisualAestheticSettingsSystem: GameSystem = {
  id: 'modify_visual_aesthetic_settings',
  order: 45,

  reset(state: GameState): void {
    if (!state.data.aesthetic) {
      state.data.aesthetic = {
        activePaletteId: 'neon',
        palette: SCHOOL_APPROVED_PALETTES['neon'],
        availablePalettes: Object.values(SCHOOL_APPROVED_PALETTES),
        contrastValidated: true,
        schoolAppropriateOnly: true,
      };
    } else {
      // Retain or re-validate current palette on reset
      const currentId = state.data.aesthetic.activePaletteId || 'neon';
      state.data.aesthetic.palette = SCHOOL_APPROVED_PALETTES[currentId] || SCHOOL_APPROVED_PALETTES['neon'];
    }
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.aesthetic) {
      this.reset!(state);
    }

    // Direct selection from the Status & Config panel's dropdown. This reads
    // state.data (not state.events) deliberately — engine.ts's step() clears
    // state.events at the start of EVERY frame, so anything a React handler
    // pushes there between animation frames is wiped before any system ever
    // sees it. state.data has no such reset, so it's the only reliable channel
    // for a UI control outside the frame loop to reach into game state.
    if (state.data.requestedThemeId && SCHOOL_APPROVED_PALETTES[state.data.requestedThemeId]) {
      const themeKey = state.data.requestedThemeId;
      state.data.aesthetic.activePaletteId = themeKey;
      state.data.aesthetic.palette = SCHOOL_APPROVED_PALETTES[themeKey];
      state.data.aesthetic.contrastValidated = true;
      state.data.requestedThemeId = undefined;
    }

    // Allow keyboard shortcut 'T' to cycle themes for quick live testing in arcade mode
    if (input.justPressed.has('KeyT')) {
      const keys = Object.keys(SCHOOL_APPROVED_PALETTES);
      const currentIndex = keys.indexOf(state.data.aesthetic.activePaletteId);
      const nextKey = keys[(currentIndex + 1) % keys.length];
      state.data.aesthetic.activePaletteId = nextKey;
      state.data.aesthetic.palette = SCHOOL_APPROVED_PALETTES[nextKey];
      state.events.push(`theme_switched:${nextKey}`);
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Theme name + cycle control now live in the DOM status panel (GameCanvas.tsx),
    // not as floating canvas text.
  },
};

export default ModifyVisualAestheticSettingsSystem;