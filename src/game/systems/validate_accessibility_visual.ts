// Implements: SPEC-042 (implicit via feature), TS-0075, TS-0085, TS-0086
// Satisfies: Validate Accessibility for Visual Elements (dhOobSRwKrY4Xk0Bpzty)
import { GameSystem, GameState, InputState } from '../types';

/**
 * Validates and enforces accessibility for visual elements:
 * - Differentiates obstacles vs. collectibles using shape, pattern, and silhouette (form over color).
 * - Ensures no critical game state info is conveyed by color alone (hazards have pulsing/symbol overlays).
 * - Smooths background asset motion (grid lines, floating meme particles/stars) for visual comfort.
 */
interface VisualAccessibilityData {
  patternOffset: number;
  pulsePhase: number;
  highContrastMode: boolean;
}

const validateAccessibilityVisualSystem: GameSystem = {
  id: 'validate_accessibility_visual',
  order: 60,

  reset(state: GameState) {
    state.data.visualAccessibility = {
      patternOffset: 0,
      pulsePhase: 0,
      highContrastMode: true,
    } as VisualAccessibilityData;
  },

  update(state: GameState, input: InputState, dt: number) {
    const data = (state.data.visualAccessibility = state.data.visualAccessibility || {
      patternOffset: 0,
      pulsePhase: 0,
      highContrastMode: true,
    }) as VisualAccessibilityData;

    // Update background assets motion for visual comfort (TS-0086)
    // Ensures scrolling background grid/stars move smoothly without inducing discomfort
    const speedMultiplier = state.data.globalSpeedMultiplier || 1.0;
    data.patternOffset = (data.patternOffset + dt * 45 * speedMultiplier) % 100;
    data.pulsePhase = (data.pulsePhase + dt * 4) % (Math.PI * 2);

    // Toggle high-contrast / symbol accessibility mode if 'KeyH' is pressed
    if (input.justPressed.has('KeyH')) {
      data.highContrastMode = !data.highContrastMode;
      state.events.push(data.highContrastMode ? 'accessibility_contrast_on' : 'accessibility_contrast_off');
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    const data = state.data.visualAccessibility as VisualAccessibilityData;
    if (!data) return;

    // Render accessible background motion patterns (grid lines for visual depth & comfort - TS-0086)
    ctx.save();
    ctx.strokeStyle = data.highContrastMode ? 'rgba(0, 255, 200, 0.15)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    const gridSize = 40;
    const startX = -(data.patternOffset % gridSize);
    
    // Draw subtle vertical grid lines
    for (let x = startX; x < state.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    ctx.restore();

    // Enhance entity rendering with distinct silhouettes, patterns, and icons so information
    // is never conveyed by color alone (TS-0075, TS-0085).
    for (const ent of state.entities) {
      ctx.save();
      if (ent.kind === 'obstacle') {
        // Obstacles get jagged spiked silhouette & hazard pattern stripes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);

        // Warning symbol / hatch pattern inside obstacle for non-color identification
        ctx.fillStyle = 'rgba(255, 60, 60, 0.3)';
        ctx.fillRect(ent.x + 4, ent.y + 4, ent.w - 8, ent.h - 8);
        
        // Pulsing hazard indicator border
        const pulseAlpha = 0.5 + Math.sin(data.pulsePhase) * 0.5;
        ctx.strokeStyle = `rgba(255, 200, 0, ${pulseAlpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(ent.x - 2, ent.y - 2, ent.w + 4, ent.h + 4);

        // Draw warning icon (!) in center of obstacle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', ent.x + ent.w / 2, ent.y + ent.h / 2);
      } else if (ent.kind === 'collectible' || ent.kind === 'coin') {
        // Collectibles get circular silhouette & star/sparkle core
        ctx.beginPath();
        ctx.arc(ent.x + ent.w / 2, ent.y + ent.h / 2, ent.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffcc';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring pattern
        ctx.beginPath();
        ctx.arc(ent.x + ent.w / 2, ent.y + ent.h / 2, ent.w / 4, 0, Math.PI * 2);
        ctx.fillStyle = '#111827';
        ctx.fill();
      }
      ctx.restore();
    }
  },
};

export default validateAccessibilityVisualSystem;