'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { GameState, InputState } from './types';
import { createInitialState, startRun, step, renderGame } from './engine';
import { loadNumber, saveNumber } from '../lib/storage';
import { SCHOOL_APPROVED_PALETTES } from './systems/modify_visual_aesthetic_settings';
import { PROFILES as DEPLOYMENT_PROFILES } from './systems/configure_multi_modal_deployment';

const W = 900;
const H = 480;

/** One row of the Status & Config panel: label + plain-English description + a control. */
function ConfigRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(102,246,255,0.12)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ color: '#9c8fc2', fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{description}</div>
      </div>
      <div style={{ flexShrink: 0, minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  );
}

/** A checkbox styled as an on/off switch, for boolean engine settings — no hotkey required to see or use it. */
function ToggleSwitch({ checked, onChange, onLabel = 'On', offLabel = 'Off' }: { checked: boolean; onChange: (v: boolean) => void; onLabel?: string; offLabel?: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <span style={{ fontSize: 11, color: checked ? '#4ff0b7' : '#9c8fc2', minWidth: 34, textAlign: 'right' }}>{checked ? onLabel : offLabel}</span>
      <span style={{ position: 'relative', width: 40, height: 22, borderRadius: 11, background: checked ? 'rgba(79,240,183,0.35)' : 'rgba(255,255,255,0.12)', border: '1px solid ' + (checked ? '#4ff0b7' : 'rgba(255,255,255,0.3)'), transition: 'background 0.15s' }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', margin: 0 }} />
        <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: checked ? '#4ff0b7' : '#fff', transition: 'left 0.15s' }} />
      </span>
    </label>
  );
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const inputRef = useRef<InputState>({
    keys: new Set<string>(), justPressed: new Set<string>(),
    pointer: { x: 0, y: 0, down: false }, pointerJustDown: false,
  });
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(0);
  // Status panel snapshot — a throttled, read-only mirror of state.data for the
  // DOM panel below. Sampling every ~0.4s (not every frame) keeps this cheap;
  // nothing here feeds back into the canvas render loop.
  const [status, setStatus] = useState<Record<string, any>>({});
  const statusSyncRef = useRef(0);
  const [liveConfig, setLiveConfig] = useState<Record<string, number>>({ speedModifier: 1, gapSize: 1, gravityMultiplier: 1 });

  if (!stateRef.current) stateRef.current = createInitialState(W, H, best);

  // Hydrate best score from localStorage on client only (avoids SSR mismatch)
  useEffect(() => {
    const stored = loadNumber('best', 0);
    setBest(stored);
    if (stateRef.current) stateRef.current.best = stored;
  }, []);

  const begin = () => {
    const s = stateRef.current!;
    s.best = Math.max(s.best, best);
    startRun(s);
    setPhase('playing');
    setScore(0);
  };

  // One-time sync on mount: liveConfig otherwise always starts at 1.00x regardless of what
  // was actually persisted (configure_game_parameters_live.ts's reset() already restores the
  // real values into state.data, synchronously, above — this just brings the sliders'
  // displayed position into agreement with it on page load/reload). Runs once, not on every
  // restart, since liveConfig already stays correct across an in-session restart on its own
  // (it's plain React state, untouched by engine.ts's state.data wipe).
  useEffect(() => {
    const d = stateRef.current?.data;
    if (!d) return;
    setLiveConfig({
      speedModifier: typeof d.speedModifier === 'number' ? d.speedModifier : 1,
      gapSize: typeof d.gapSize === 'number' ? d.gapSize : 1,
      gravityMultiplier: typeof d.gravityMultiplier === 'number' ? d.gravityMultiplier : 1,
    });
  }, []);

  useEffect(() => {
    // RAW input only — the core loop / mechanics INTERPRET it per genre.
    const down = (e: KeyboardEvent) => {
      const i = inputRef.current;
      if (!i.keys.has(e.code)) i.justPressed.add(e.code);  // edge-trigger
      i.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      const s = stateRef.current; if (s && s.phase !== 'playing') begin();
    };
    const up = (e: KeyboardEvent) => { inputRef.current.keys.delete(e.code); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const frame = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      let dt = (now - lastRef.current) / 1000; lastRef.current = now; if (dt > 0.05) dt = 0.05;
      const s = stateRef.current!;
      const prev = s.phase;
      step(s, inputRef.current, dt);
      inputRef.current.justPressed.clear(); inputRef.current.pointerJustDown = false;
      renderGame(ctx, s);
      statusSyncRef.current += dt;
      if (statusSyncRef.current > 0.4) {
        statusSyncRef.current = 0;
        const d = s.data;
        setStatus({
          fps: d.performanceMonitor?.fps,
          governor: d.performanceMonitor?.lockoutTimer > 0 ? `LOCKOUT (${Math.ceil(d.performanceMonitor.lockoutTimer)}s)` : 'STABLE',
          themeId: d.aesthetic?.activePaletteId ?? 'neon',
          modeId: d.deploymentProfile ?? 'quick_break',
          intensity: typeof d.intensity === 'number' ? d.intensity : undefined,
          hardCapReached: !!d.hardCapReached,
          sessionDuration: typeof d.sessionDuration === 'number' ? d.sessionDuration : undefined,
          stableStateLock: !!d.targetDurationReached,
          audioMuted: !!d.audio?.muted,
          debugEnabled: !!d.debug?.enabled,
          highContrast: !!d.visualAccessibility?.highContrastMode,
        });
      }
      if (s.phase !== prev) {
        setPhase(s.phase);
        if (s.phase === 'over') {
          // Math.floor wraps the WHOLE max, not just s.score — state.best
          // is not ownership-sandboxed by engine.ts (only phase/player/
          // entities/score are), so any mechanic that ever assigns it a raw
          // fractional value must not have that corruption persist here.
          const b = Math.floor(Math.max(s.best, s.score)); s.best = b; setBest(b); saveNumber('best', b);
        }
      }
      if (s.phase === 'playing') setScore(Math.floor(s.score));
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const toCanvas = (e: React.PointerEvent) => {
    const c = canvasRef.current; if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    const pt = toCanvas(e); const i = inputRef.current;
    i.pointer.x = pt.x; i.pointer.y = pt.y; i.pointer.down = true; i.pointerJustDown = true;
    if (phase !== 'playing') begin();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const pt = toCanvas(e); inputRef.current.pointer.x = pt.x; inputRef.current.pointer.y = pt.y;
  };
  const onPointerUp = () => { inputRef.current.pointer.down = false; };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'radial-gradient(circle at 50% 30%, #2a0a4a 0%, #0d0221 70%)', color: '#fff', fontFamily: 'ui-monospace, Menlo, monospace' }}>
      <h1 style={{ margin: 0, letterSpacing: 6, textShadow: '0 0 12px #ff2fd0, 0 0 24px #00f0ff' }}>GLITCHDASH14</h1>
      <div style={{ display: 'flex', gap: 26, letterSpacing: 2 }}>
        <span style={{ color: '#ff8ae2' }}>SCORE {score}</span>
        <span style={{ color: '#66f6ff' }}>BEST {best}</span>
      </div>
      <div style={{ position: 'relative', width: W, maxWidth: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          role="application" aria-label="Game canvas. Use keys, arrows, or click to play."
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12, border: '2px solid #ff2fd0', boxShadow: '0 0 30px rgba(255,47,208,0.5)', touchAction: 'none', cursor: 'pointer' }} />
        {phase !== 'playing' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,2,33,0.62)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: phase === 'over' ? '#ff2fd0' : '#00f0ff', textShadow: '0 0 12px currentColor' }}>
              {phase === 'over' ? 'GAME OVER — score ' + score : 'Ready?'}
            </div>
            <button onClick={begin} style={{ marginTop: 16, background: 'linear-gradient(90deg,#ff2fd0,#00f0ff)', color: '#0d0221', border: 'none', borderRadius: 8, padding: '12px 26px', fontSize: 17, fontWeight: 700, letterSpacing: 2, cursor: 'pointer' }}>
              {phase === 'over' ? 'RETRY' : 'START'}
            </button>
            <div style={{ marginTop: 12, fontSize: 12, color: '#b79ce0', letterSpacing: 1 }}>KEYS / ARROWS / CLICK</div>
          </div>
        )}
      </div>
      {/* Always-visible reference link to the end-user wiki */}
      {/* (public/wiki.html, served at /wiki.html). Persists across every phase. */}
      <a href="/wiki.html" target="_blank" rel="noreferrer"
        style={{ marginTop: 6, fontSize: 12, letterSpacing: 1, color: '#66f6ff', textDecoration: 'none', opacity: 0.85, borderBottom: '1px solid rgba(102,246,255,0.4)', paddingBottom: 1 }}>
        Wiki / Reference
      </a>

      {/* Collapsible status/config pane — lives outside the canvas so it never
          overlaps gameplay. Every engine-tunable setting is one row: what it is,
          what it does (from the original task spec), and a real control — a
          toggle for booleans, a dropdown for multi-choice, a slider for ranges.
          No setting requires knowing a hotkey to find or use it. */}
      <details style={{ marginTop: 4, width: W, maxWidth: '100%', color: '#cbd5e1', fontSize: 12 }}>
        <summary style={{ cursor: 'pointer', color: '#66f6ff', letterSpacing: 1, userSelect: 'none' }}>Status &amp; Config — see and change what's driving the game</summary>
        <div style={{ marginTop: 10, padding: '4px 14px', borderRadius: 8, border: '1px solid rgba(102,246,255,0.25)', background: 'rgba(13,2,33,0.55)' }}>

          <ConfigRow label="Audio" description="Persistent mute toggle for the arcade sound effects (jump/score/hit). Stays muted across restarts and reloads once set. — Manage Game Audio Controls">
            <ToggleSwitch checked={!status.audioMuted} onLabel="On" offLabel="Muted"
              onChange={() => { inputRef.current.justPressed.add('KeyM'); }} />
          </ConfigRow>

          <ConfigRow label="Debug Overlay" description="Real-time calibration readout: current speed, elapsed time, obstacle count, and FPS. For tuning, not needed to play. — Implement Debug Mode for Real-Time Calibration">
            <ToggleSwitch checked={!!status.debugEnabled} onLabel="Shown" offLabel="Hidden"
              onChange={() => { inputRef.current.justPressed.add('Backquote'); }} />
          </ConfigRow>

          <ConfigRow label="Accessibility (High Contrast)" description="Distinguishes obstacles from collectibles by shape and pattern, not color alone, for colorblind players. — Validate Accessibility for Visual Elements">
            <ToggleSwitch checked={!!status.highContrast} onLabel="On" offLabel="Off"
              onChange={() => { inputRef.current.justPressed.add('KeyH'); }} />
          </ConfigRow>

          <ConfigRow label="Visual Theme" description="School-appropriate color palette for the whole scene. — Modify Visual Aesthetic Settings">
            <select value={status.themeId ?? 'neon'}
              onChange={(e) => { const s = stateRef.current; if (s) s.data.requestedThemeId = e.target.value; }}
              style={{ background: '#1a0b33', color: '#fff', border: '1px solid rgba(102,246,255,0.4)', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
              {Object.values(SCHOOL_APPROVED_PALETTES).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </ConfigRow>

          <ConfigRow label="Deployment Mode" description="Tunes pacing for how the game is being played: a quick solo break, a shared cafeteria projector, or a standard classroom session. — Configure Multi-Modal Deployment Environment">
            <select value={status.modeId ?? 'quick_break'}
              onChange={(e) => { const s = stateRef.current; if (s) s.data.requestedDeploymentProfile = e.target.value; }}
              style={{ background: '#1a0b33', color: '#fff', border: '1px solid rgba(102,246,255,0.4)', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
              {Object.entries(DEPLOYMENT_PROFILES).map(([key, p]: [string, any]) => (
                <option key={key} value={key}>{p.name}</option>
              ))}
            </select>
          </ConfigRow>

          <ConfigRow label="Speed Modifier" description="Multiplies obstacle/course speed on top of the automatic difficulty ramp. Actually applied to the run loop — not just a display number. — Configure Game Parameters Live">
            <SliderControl dataKey="speedModifier" min={0.5} max={3.0} liveConfig={liveConfig} setLiveConfig={setLiveConfig} stateRef={stateRef} />
          </ConfigRow>

          <ConfigRow label="Gap Size Factor" description="Multiplies the space between obstacles — higher is more forgiving, lower is denser. — Configure Game Parameters Live">
            <SliderControl dataKey="gapSize" min={0.5} max={2.5} liveConfig={liveConfig} setLiveConfig={setLiveConfig} stateRef={stateRef} />
          </ConfigRow>

          <ConfigRow label="Gravity Multiplier" description="Scales how fast the character falls, which changes effective jump height and hang time. — Configure Game Parameters Live">
            <SliderControl dataKey="gravityMultiplier" min={0.5} max={2.0} liveConfig={liveConfig} setLiveConfig={setLiveConfig} stateRef={stateRef} />
          </ConfigRow>

          <ConfigRow label="Governor / Performance" description="Auto-throttles difficulty for ~5s after a frame-time spike, so slow hardware isn't penalized. Read-only — this reacts to your device, it isn't a setting. — Monitor Performance for Fairness">
            <span style={{ color: '#fff' }}>{status.fps ?? '—'} fps · {status.governor ?? 'STABLE'}</span>
          </ConfigRow>

          <ConfigRow label="Intensity / Hard Cap" description="Smoothed difficulty curve based on score and survival time, capped so it stays beatable. Read-only. — Apply Smoothing Functions to Difficulty Scaling, Configure Intensity Scaling Curve">
            <span style={{ color: '#fff' }}>{typeof status.intensity === 'number' ? status.intensity.toFixed(2) : '—'}{status.hardCapReached ? <b style={{ color: '#f87171' }}> HARD CAP</b> : null}</span>
          </ConfigRow>

          <ConfigRow label="Session Progress" description="How long the current run has lasted; locks in a steady difficulty after 90 seconds. Read-only. — Manage session progress">
            <span style={{ color: '#fff' }}>{typeof status.sessionDuration === 'number' ? `${Math.floor(status.sessionDuration)}s` : '—'}{status.stableStateLock ? <b style={{ color: '#facc15' }}> LOCKED</b> : null}</span>
          </ConfigRow>

        </div>
      </details>
    </div>
  );
}

/** A range slider bound directly to state.data.<dataKey>, read by base_player.ts every frame. */
function SliderControl({ dataKey, min, max, liveConfig, setLiveConfig, stateRef }: {
  dataKey: 'speedModifier' | 'gapSize' | 'gravityMultiplier';
  min: number; max: number;
  liveConfig: Record<string, number>;
  setLiveConfig: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  stateRef: React.RefObject<GameState | null>;
}) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: 180 }}>
      <input
        type="range" min={min} max={max} step={0.05}
        value={liveConfig[dataKey]}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          setLiveConfig((prev) => ({ ...prev, [dataKey]: v }));
          const s = stateRef.current; if (s) s.data[dataKey] = v;
        }}
        style={{ flex: 1 }}
      />
      <span style={{ width: 42, textAlign: 'right', color: '#fff' }}>{liveConfig[dataKey].toFixed(2)}x</span>
    </span>
  );
}
