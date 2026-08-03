/**
 * Implements: SPEC-042 (implicit via UC)
 * Satisfies: TS-0013, TS-0020, TS-0027
 * 
 * View Session Performance Metrics game system.
 * Responsible for tracking, formatting, and exposing real-time score metrics,
 * high score achievements, and high-contrast accessible typography data for
 * color vision deficiency support during active gameplay and game over states.
 */

import { GameSystem, GameState, InputState } from '../types';

const viewSessionPerformanceMetricsSystem: GameSystem = {
  id: 'view_session_performance_metrics',
  order: 35,

  reset(state: GameState): void {
    state.data.viewPerformance = {
      lastScore: 0,
      peakScoreDuringSession: 0,
      accessibleModeEnabled: true,
      displayMetricsReady: true,
      typographyConfig: {
        fontFamily: 'Roboto, sans-serif',
        fontWeightBold: '700',
        highContrastColor: '#FFFFFF',
        secondaryContrastColor: '#00E5FF'
      }
    };
  },

  update(state: GameState, _input: InputState, _dt: number): void {
    if (!state.data.viewPerformance) {
      this.reset!(state);
    }

    const perf = state.data.viewPerformance;
    const currentScore = typeof state.score === 'number' ? state.score : 0;
    const bestScore = typeof state.best === 'number' ? state.best : 0;

    perf.lastScore = currentScore;
    if (currentScore > perf.peakScoreDuringSession) {
      perf.peakScoreDuringSession = currentScore;
    }

    // Expose structured performance metrics for UI/HUD reflection without duplicating canvases
    state.data.liveScoreDisplay = {
      formattedScore: currentScore.toLocaleString(),
      formattedBest: Math.max(bestScore, perf.peakScoreDuringSession).toLocaleString(),
      isGameOver: state.phase === 'over',
      isActive: state.phase === 'playing',
      accessibilityLabel: `Current score: ${currentScore}, Best score: ${Math.max(bestScore, perf.peakScoreDuringSession)}`
    };

    // Consume score or over events to update telemetry scratchpad
    if (state.events && state.events.includes('over')) {
      perf.lastScore = currentScore;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Canvas rendering for supplemental accessible performance HUD overlays if needed,
    // keeping contrast high to support color vision deficiency compliance (TS-0013, TS-0020, TS-0027).
    if (state.phase === 'over' && state.data.liveScoreDisplay) {
      ctx.save();
      ctx.font = '700 24px Roboto, sans-serif';
      ctx.fillStyle = '#00E5FF';
      ctx.textAlign = 'center';
      
      const centerX = state.width / 2;
      const centerY = state.height / 2 + 60;

      // Draw high-contrast accessible session summary badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(centerX - 160, centerY - 20, 320, 60);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 160, centerY - 20, 320, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(
        `Final: ${state.data.liveScoreDisplay.formattedScore} | Best: ${state.data.liveScoreDisplay.formattedBest}`,
        centerX,
        centerY + 18
      );
      ctx.restore();
    }
  }
};

export default viewSessionPerformanceMetricsSystem;