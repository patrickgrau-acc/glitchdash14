"use client";

import { AlchemyBadge } from "@/components/ui/AlchemyBadge";

/**
 * Gaming / Community Promotional Landing Page
 * Served when the request hostname is glitch-dash.com
 *
 * Highlights the game itself, invites players to jump in,
 * and links to community resources like the wiki.
 */
export default function GamingLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white">
      {/* Decorative neon glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        {/* Game Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-wider sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-pink-400 via-cyan-300 to-yellow-300 bg-clip-text text-transparent">
              GLITCHDASH
            </span>
            <span className="text-pink-400">14</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-purple-200 sm:text-xl">
            High-Energy Endless Runner · Zero Friction · Instant Action
          </p>
        </div>

        {/* Game Description */}
        <div className="mb-10 max-w-2xl space-y-4">
          <p className="text-base text-slate-300 sm:text-lg">
            Jump into the neon-soaked arcade madness. No downloads, no logins,
            no waiting — just press any key and run. How far can you push it?
          </p>

          {/* Feature cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">🏃</div>
              <h3 className="text-sm font-semibold text-pink-300">Endless Runner</h3>
              <p className="mt-1 text-xs text-slate-400">
                Dodge, jump, and dash through ever-increasing obstacles.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">⚡</div>
              <h3 className="text-sm font-semibold text-cyan-300">Instant Retry</h3>
              <p className="mt-1 text-xs text-slate-400">
                Crash? Tap any key to restart instantly. No load screens.
              </p>
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">🎨</div>
              <h3 className="text-sm font-semibold text-yellow-300">Neon Aesthetics</h3>
              <p className="mt-1 text-xs text-slate-400">
                Vaporwave visuals, particle effects, and meme-tier game-over screens.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/?play"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-all hover:-translate-y-0.5 hover:shadow-pink-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            🎮 Play Now
          </a>
          <a
            href="/wiki.html"
            className="inline-flex items-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-slate-300 transition-all hover:-translate-y-0.5 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            📖 Player Wiki & Guide
          </a>
        </div>

        {/* Stats / Social Proof */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-300">60 FPS</div>
            <div className="text-xs text-slate-500">Butter-smooth gameplay</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-300">0s</div>
            <div className="text-xs text-slate-500">Load time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-300">∞</div>
            <div className="text-xs text-slate-500">Replayability</div>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Browser-based · Works on any device · No installation required
        </p>
      </div>

      <AlchemyBadge />
    </div>
  );
}
