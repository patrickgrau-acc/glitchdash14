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
  farOffset: number;
  midOffset: number;
  nearOffset: number;
  pulsePhase: number;
  highContrastMode: boolean;
}

const HIGH_CONTRAST_STORAGE_KEY = 'glitchdash14_high_contrast';

function loadHighContrast(): boolean {
  try {
    const stored = localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  } catch {
    return true;
  }
}

function saveHighContrast(val: boolean): void {
  try { localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(val)); } catch { /* ignore */ }
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Horizontal fade mask for anything that scrolls laterally across the canvas (the near-grid
// columns/rows): full strength across the middle, fading to fully transparent right at the
// left/right edges. Without this, a column crossing the canvas boundary goes from fully
// opaque to entirely absent in a single frame — a hard "pop" rather than a scroll. Building
// the gradient in absolute canvas coordinates means it fades each element based on wherever
// it currently sits on screen, regardless of the element's own path/shape.
function edgeFadeGradient(ctx: CanvasRenderingContext2D, width: number, hex: string, peakAlpha: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, width, 0);
  g.addColorStop(0, withAlpha(hex, 0));
  g.addColorStop(0.1, withAlpha(hex, peakAlpha));
  g.addColorStop(0.9, withAlpha(hex, peakAlpha));
  g.addColorStop(1, withAlpha(hex, 0));
  return g;
}

const validateAccessibilityVisualSystem: GameSystem = {
  id: 'validate_accessibility_visual',
  order: 60,

  reset(state: GameState) {
    // Restore the player's last choice instead of hardcoding true — engine.ts's
    // startRun() wipes state.data on every restart, so without this the toggle
    // silently reverted to "on" every new game regardless of what was selected.
    state.data.visualAccessibility = {
      farOffset: 0,
      midOffset: 0,
      nearOffset: 0,
      pulsePhase: 0,
      highContrastMode: loadHighContrast(),
    } as VisualAccessibilityData;
  },

  update(state: GameState, input: InputState, dt: number) {
    const data = (state.data.visualAccessibility = state.data.visualAccessibility || {
      farOffset: 0,
      midOffset: 0,
      nearOffset: 0,
      pulsePhase: 0,
      highContrastMode: loadHighContrast(),
    }) as VisualAccessibilityData;

    // Parallax background only advances while the run is actually in motion, driven by
    // base_player.ts's real world-scroll speed (state.data.speed, already folded through
    // the difficulty curve's globalSpeedMultiplier) rather than wall-clock dt alone — so it
    // never drifts on the ready/game-over screens and always tracks live difficulty (TS-0086).
    if (state.phase === 'playing') {
      const worldSpeed = state.data.speed ?? 0;
      // Three depth layers scroll at different fractions of world speed for parallax.
      data.farOffset = (data.farOffset + worldSpeed * dt * 0.05) % 2000;
      data.midOffset = (data.midOffset + worldSpeed * dt * 0.22) % 2000;
      data.nearOffset = (data.nearOffset + worldSpeed * dt * 0.9) % 2000;
    }
    data.pulsePhase = (data.pulsePhase + dt * 4) % (Math.PI * 2);

    // Toggle high-contrast / symbol accessibility mode if 'KeyH' is pressed
    if (input.justPressed.has('KeyH')) {
      data.highContrastMode = !data.highContrastMode;
      saveHighContrast(data.highContrastMode);
      state.events.push(data.highContrastMode ? 'accessibility_contrast_on' : 'accessibility_contrast_off');
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    const data = state.data.visualAccessibility as VisualAccessibilityData;
    if (!data) return;

    // Multi-layer synthwave horizon parallax (TS-0086) — replaces the old flat scrolling
    // vertical-line grid. Three depth layers (distant ridge, mid sky bands, near angled
    // floor grid) drift at different fractions of world speed, converging toward a single
    // vanishing point on the horizon for an immersive angled-perspective effect.
    const palette = state.data.aesthetic?.palette;
    const nearColor = palette?.accent || '#00f0ff';
    // Deliberately NOT palette.primary — base_player.ts (locked) uses that exclusively for
    // the player character. Sharing it here made the mountain and the player the same
    // color, which is part of why a jump into the horizon band read as "going through" it.
    const farColor = palette?.accent || '#00f0ff';
    const boost = data.highContrastMode ? 1 : 0.5;
    const horizonY = state.height * 0.58;
    const vanishX = state.width / 2;

    ctx.save();

    // Layer 1 (farthest, slowest parallax): soft horizon glow ("digital sun") occluded by
    // a solid drifting ridge silhouette — the sun must not shine through the mountain or
    // bleed past the horizon into the ground grid below it.
    const sunRadius = state.width * 0.35;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonY - sunRadius, state.width, sunRadius); // clip to the sky, stops exactly at the horizon
    ctx.clip();
    const sun = ctx.createRadialGradient(vanishX, horizonY, 0, vanishX, horizonY, sunRadius);
    sun.addColorStop(0, withAlpha(farColor, 0.28 * boost));
    sun.addColorStop(1, withAlpha(farColor, 0));
    ctx.fillStyle = sun;
    ctx.fillRect(0, horizonY - sunRadius, state.width, sunRadius);
    ctx.restore();

    // Solid mountain silhouette, filled (not stroked) down to the horizon so it actually
    // blocks the sun's glow behind it rather than letting it shine through an outline.
    const ridgeStep = 60;
    const ridgeStart = -(data.farOffset % ridgeStep) - ridgeStep;
    ctx.fillStyle = withAlpha(farColor, Math.min(1, 0.55 + 0.45 * boost));
    ctx.beginPath();
    ctx.moveTo(ridgeStart, horizonY);
    for (let x = ridgeStart; x <= state.width + ridgeStep; x += ridgeStep) {
      const ridgeY = horizonY - 10 - Math.abs(Math.sin((x + data.farOffset) * 0.01)) * 18;
      ctx.lineTo(x, ridgeY);
    }
    ctx.lineTo(state.width + ridgeStep, horizonY);
    ctx.closePath();
    ctx.fill();

    // Layer 2 (mid): sparse bands receding above the horizon into the sky.
    ctx.strokeStyle = withAlpha(nearColor, 0.1 * boost);
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = horizonY - i * 14 - (data.midOffset % 14);
      if (y < 0) continue;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke();
    }

    // Horizon line — the vanishing point every angled grid line below converges toward.
    ctx.strokeStyle = withAlpha(nearColor, 0.32 * boost);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, horizonY); ctx.lineTo(state.width, horizonY); ctx.stroke();

    // Layer 3 (nearest, fastest parallax): ONE angled floor grid, not two overlaid ones.
    // Rows are plain full-width horizontal lines — a line spanning the entire canvas has
    // no visible x-position to animate, so they stay fixed (this is what gives the
    // non-linear horizon-hugging perspective spacing). The columns are what actually
    // carries the lateral motion: they slide right-to-left and wrap, like lane markers
    // sliding past, while still converging on the same fixed vanishing point.
    const numCols = 10;
    const colSpan = state.width * 1.6;
    const colSpacing = colSpan / numCols;
    const colShift = data.nearOffset % colSpacing;
    // Edge-faded instead of flat alpha — a column's bottom point scrolling across the
    // canvas boundary now fades out well before it disappears and fades in after it
    // appears, instead of cutting in/out abruptly at the edge (the reported "pop").
    ctx.strokeStyle = edgeFadeGradient(ctx, state.width, nearColor, 0.18 * boost);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = -1; i <= numCols + 1; i++) {
      const bottomX = i * colSpacing - state.width * 0.3 - colShift;
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, state.height);
    }
    ctx.stroke();

    const numRows = 6;
    const groundSpan = state.height - horizonY;
    for (let n = 1; n <= numRows; n++) {
      const depth = n / numRows; // 0 at the horizon -> 1 at the bottom, fixed perspective spacing
      const y = horizonY + groundSpan * Math.pow(depth, 2.2);
      if (y > state.height) continue;
      ctx.strokeStyle = edgeFadeGradient(ctx, state.width, nearColor, (0.06 + depth * 0.14) * boost);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    ctx.restore();

    // Re-assert the player above the mountain/grid backdrop. base_player.ts (order 0,
    // locked) draws the player BEFORE this system (order 60) paints the parallax layers
    // over the whole canvas — a jump arcing into the horizon band (a normal jump easily
    // clears it: ~140px peak height vs. a horizon set at 58% of a 480px-tall canvas) would
    // otherwise get painted over by the solid mountain fill and look like it went behind
    // it. Redrawing it here (read-only — base_player still owns the player's actual state)
    // keeps the character in the foreground at any jump height, in its own primary color
    // that no longer overlaps the mountain/grid's accent color above.
    const p = state.player;
    if (p) {
      const playerColor = palette?.primary || '#ff2fd0';
      ctx.save();
      ctx.shadowColor = playerColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = playerColor;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

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