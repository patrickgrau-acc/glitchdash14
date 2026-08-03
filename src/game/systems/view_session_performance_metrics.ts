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
    // Game-over panel (incl. final/best score) is owned by calculate_display_final_session.ts —
    // this badge was drawing directly on top of it at the same screen position.
  }
};

export default viewSessionPerformanceMetricsSystem;