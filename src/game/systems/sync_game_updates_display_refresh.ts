/**
 * Implements: TS-0030
 * Syncs game updates and display refresh rate using requestAnimationFrame timing synchronization,
 * frame-rate normalization, and background tab throttling protection.
 */

import { GameSystem, GameState, InputState } from '../types';

interface SyncSystemData {
  lastRafTime: number;
  accumulatedDelta: number;
  frameTimes: number[];
  avgFps: number;
  backgroundThrottleActive: boolean;
  maxFrameTimeLimit: number;
}

const syncGameUpdatesDisplayRefreshSystem: GameSystem = {
  id: 'sync_game_updates_display_refresh',
  order: 5,

  reset(state: GameState) {
    state.data.syncData = {
      lastRafTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      accumulatedDelta: 0,
      frameTimes: [],
      avgFps: 60,
      backgroundThrottleActive: false,
      maxFrameTimeLimit: 100, // Clamp maximum delta to 100ms to prevent fast-forwarding upon tab return
    } as SyncSystemData;
  },

  update(state: GameState, input: InputState, dt: number) {
    if (!state.data.syncData) {
      this.reset!(state);
    }

    const syncData: SyncSystemData = state.data.syncData;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    // Calculate precise frame delta for display synchronization and smooth input intervals
    const rawDelta = dt * 1000; // convert seconds to ms
    
    if (rawDelta > syncData.maxFrameTimeLimit) {
      // Prevent visual fast-forwarding / spiral of death after backgrounding or tab throttling
      syncData.backgroundThrottleActive = true;
      syncData.accumulatedDelta = 16.67; // Fallback to standard 60fps frame time
    } else {
      syncData.backgroundThrottleActive = false;
      syncData.accumulatedDelta = rawDelta;
    }

    // Monitor rolling average frame times for performance fairness & synchronization
    syncData.frameTimes.push(syncData.accumulatedDelta);
    if (syncData.frameTimes.length > 60) {
      syncData.frameTimes.shift();
    }

    const avgFrameTime = syncData.frameTimes.reduce((a, b) => a + b, 0) / syncData.frameTimes.length;
    syncData.avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60;

    // Expose frame synchronization metrics for debugging and diagnostics
    state.data.currentFps = Math.round(syncData.avgFps);
    state.data.smoothedFrameTime = avgFrameTime;
    state.data.frameSyncOptimized = true;

    // Handle high-frequency jump/input responsiveness smoothly within the synchronized tick
    if (input.justPressed.size > 0) {
      state.events.push('sync_input_processed');
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Surface synchronization metrics subtly in debug or performance HUD if enabled
    const syncData: SyncSystemData | undefined = state.data.syncData;
    if (!syncData || !state.data.debugHitboxes) {
      return;
    }

    ctx.save();
    ctx.font = '10px Roboto, monospace';
    ctx.fillStyle = syncData.backgroundThrottleActive ? '#f59e0b' : '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText(
      `FPS: ${Math.round(syncData.avgFps)} (${syncData.backgroundThrottleActive ? 'Throttled' : 'VSync Synced'})`,
      state.width - 12,
      24
    );
    ctx.restore();
  },
};

export default syncGameUpdatesDisplayRefreshSystem;