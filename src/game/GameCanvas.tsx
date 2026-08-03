'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { GameState, InputState } from './types';
import { createInitialState, startRun, step, renderGame } from './engine';
import { loadNumber, saveNumber } from '../lib/storage';

const W = 900;
const H = 480;

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
  const [best, setBest] = useState<number>(() => loadNumber('best', 0));

  if (!stateRef.current) stateRef.current = createInitialState(W, H, best);

  const begin = () => {
    const s = stateRef.current!;
    s.best = Math.max(s.best, best);
    startRun(s);
    setPhase('playing');
    setScore(0);
  };

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
    </div>
  );
}
