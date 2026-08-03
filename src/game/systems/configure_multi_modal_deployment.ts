// Implements: SPEC-l49NNrJHkhpUIgQgu9Te
// Satisfies: TS-0079 (quick-break difficulty scaling), TS-0084 (cafeteria projection visual optimization)

import { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Multi-Modal Deployment Environment (l49NNrJHkhpUIgQgu9Te)
 * Manages school-specific arcade deployment profiles:
 * - 'Quick Individual Break': Optimized for 10-90s high-intensity loops with accelerated ramp rates.
 * - 'Large-Scale Projection': Optimized for cafeteria/auditorium displays with high-contrast palette flags and scaled metrics.
 */
interface DeploymentConfigProfile {
  name: string;
  speedMultiplier: number;
  gravityMultiplier: number;
  obstacleGapFactor: number;
  contrastMode: boolean;
  intensityRampRate: number;
}

export const PROFILES: Record<string, DeploymentConfigProfile> = {
  quick_break: {
    name: 'Quick Individual Break',
    speedMultiplier: 1.4,
    gravityMultiplier: 1.25,
    obstacleGapFactor: 0.85,
    contrastMode: false,
    intensityRampRate: 2.5, // Rapid difficulty scaling for 10-90s loops
  },
  cafeteria_projection: {
    name: 'Large-Scale Projection',
    speedMultiplier: 1.1,
    gravityMultiplier: 1.0,
    obstacleGapFactor: 1.1,
    contrastMode: true, // High-contrast electric blue / lime green palette
    intensityRampRate: 1.2,
  },
  standard: {
    name: 'Standard Classroom',
    speedMultiplier: 1.0,
    gravityMultiplier: 1.0,
    obstacleGapFactor: 1.0,
    contrastMode: false,
    intensityRampRate: 1.0,
  }
};

const configureMultiModalDeploymentSystem: GameSystem = {
  id: 'configure_multi_modal_deployment',
  order: 5,

  reset(state: GameState): void {
    // Initialise deployment profile configuration in state.data
    // Default to quick_break if not previously configured, or check URL/storage preference
    const activeProfileKey = state.data.deploymentProfile || 'quick_break';
    const profile = PROFILES[activeProfileKey] || PROFILES.quick_break;

    state.data.deploymentConfig = profile;
    state.data.globalSpeedMultiplier = profile.speedMultiplier;
    state.data.obstacleGapFactor = profile.obstacleGapFactor;
    state.data.contrastMode = profile.contrastMode;
    state.data.intensityRampRate = profile.intensityRampRate;

    // Push initialization event for telemetry/debug
    if (!state.events.includes('deployment_configured')) {
      state.events.push(`deployment_configured_${activeProfileKey}`);
    }
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Dedicated key — was 'KeyM', which collided with the audio mute toggle.
    let targetKey: string | undefined;
    if (input.justPressed.has('KeyP')) {
      const keys = Object.keys(PROFILES);
      const currentKey = state.data.deploymentProfile || 'quick_break';
      targetKey = keys[(keys.indexOf(currentKey) + 1) % keys.length];
    }
    // Direct selection from the Status & Config panel's dropdown, via state.data
    // rather than state.events — engine.ts's step() clears state.events at the
    // start of EVERY frame, so anything a React handler pushes there between
    // animation frames is wiped before any system ever reads it.
    if (state.data.requestedDeploymentProfile && PROFILES[state.data.requestedDeploymentProfile]) {
      targetKey = state.data.requestedDeploymentProfile;
      state.data.requestedDeploymentProfile = undefined;
    }

    if (targetKey && PROFILES[targetKey]) {
      const profile = PROFILES[targetKey];

      state.data.deploymentProfile = targetKey;
      state.data.deploymentConfig = profile;
      state.data.globalSpeedMultiplier = profile.speedMultiplier;
      state.data.obstacleGapFactor = profile.obstacleGapFactor;
      state.data.contrastMode = profile.contrastMode;
      state.data.intensityRampRate = profile.intensityRampRate;

      state.events.push(`deployment_profile_switched_${targetKey}`);
    }

    // Apply active high-intensity ramp rate during gameplay phase
    if (state.phase === 'playing') {
      const ramp = state.data.intensityRampRate || 1.0;
      // Expose scaled intensity factor for other dependent scaling systems
      state.data.effectiveIntensity = (state.t * 0.1) * ramp;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Mode name now lives in the DOM status panel (GameCanvas.tsx) — only the
    // actual visual treatment (the high-contrast border) stays on canvas.
    const contrast = state.data.contrastMode;
    if (contrast) {
      ctx.save();
      // High-visibility border highlight for large-scale projection visibility (TS-0084)
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, state.width - 8, state.height - 8);
      ctx.restore();
    }
  }
};

export default configureMultiModalDeploymentSystem;