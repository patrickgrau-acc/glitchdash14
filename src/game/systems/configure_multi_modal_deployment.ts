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

const PROFILES: Record<string, DeploymentConfigProfile> = {
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
    // Allow toggle via shortcut key 'KeyM' for multi-modal environment demo switching
    if (input.justPressed.has('KeyM')) {
      const keys = Object.keys(PROFILES);
      const currentKey = state.data.deploymentProfile || 'quick_break';
      const nextIdx = (keys.indexOf(currentKey) + 1) % keys.length;
      const newKey = keys[nextIdx];
      const profile = PROFILES[newKey];

      state.data.deploymentProfile = newKey;
      state.data.deploymentConfig = profile;
      state.data.globalSpeedMultiplier = profile.speedMultiplier;
      state.data.obstacleGapFactor = profile.obstacleGapFactor;
      state.data.contrastMode = profile.contrastMode;
      state.data.intensityRampRate = profile.intensityRampRate;

      state.events.push(`deployment_profile_switched_${newKey}`);
    }

    // Apply active high-intensity ramp rate during gameplay phase
    if (state.phase === 'playing') {
      const ramp = state.data.intensityRampRate || 1.0;
      // Expose scaled intensity factor for other dependent scaling systems
      state.data.effectiveIntensity = (state.t * 0.1) * ramp;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const contrast = state.data.contrastMode;
    const profileName = state.data.deploymentConfig?.name || 'Quick Break';

    // If large-scale projection contrast mode is active, overlay high-visibility indicator badge
    ctx.save();
    ctx.font = 'bold 12px Roboto, sans-serif';
    ctx.fillStyle = contrast ? '#00FFCC' : 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    
    // Draw subtle deployment mode indicator in top right corner (non-intrusive)
    const text = `Mode: ${profileName} [Press M]`;
    ctx.fillText(text, state.width - 16, 28);

    if (contrast) {
      // High-visibility border highlight for large-scale projection visibility (TS-0084)
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, state.width - 8, state.height - 8);
    }
    ctx.restore();
  }
};

export default configureMultiModalDeploymentSystem;