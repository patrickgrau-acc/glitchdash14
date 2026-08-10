"use client";

import { AlchemyBadge } from "@/components/ui/AlchemyBadge";

/**
 * Alchemy SDLC Promotional Landing Page
 * Served when the request hostname is alchemyglitchdash.com
 *
 * Showcases the Alchemy SDLC platform and invites visitors to learn more,
 * with a secondary CTA to play the GlitchDash14 demo game.
 */
export default function AlchemyLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-white">Alche</span>
            <span className="text-sky-300">my</span>
            <span className="text-white"> SDLC</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300 sm:text-xl">
            AI-Powered Software Development Lifecycle Platform
          </p>
        </div>

        {/* Value Proposition */}
        <div className="mb-12 max-w-2xl space-y-6">
          <p className="text-base text-slate-400 sm:text-lg">
            Alchemy SDLC transforms how teams build software. From requirements
            to deployment, our AI-driven platform accelerates every phase of
            your development lifecycle while maintaining quality and compliance.
          </p>

          {/* Feature highlights */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">⚡</div>
              <h3 className="text-sm font-semibold text-sky-300">Rapid Delivery</h3>
              <p className="mt-1 text-xs text-slate-400">
                Ship features faster with AI-assisted planning and implementation.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">🛡️</div>
              <h3 className="text-sm font-semibold text-sky-300">Quality Built-In</h3>
              <p className="mt-1 text-xs text-slate-400">
                Automated testing, reviews, and compliance checks at every stage.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-2xl">🔄</div>
              <h3 className="text-sm font-semibold text-sky-300">Full Lifecycle</h3>
              <p className="mt-1 text-xs text-slate-400">
                Requirements, design, code, test, deploy — one unified platform.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="https://alchemistaipro.com/?utm_source=alchemyglitchdash&utm_medium=landing&utm_campaign=sdlc-promo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-sky-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-sky-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Learn More About Alchemy SDLC
          </a>
          <a
            href="/?play"
            className="inline-flex items-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-slate-300 transition-all hover:-translate-y-0.5 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            🎮 Play GlitchDash14 Demo
          </a>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-xs text-slate-500">
          GlitchDash14 was built entirely using the Alchemy SDLC platform — from spec to deployment.
        </p>
      </div>

      <AlchemyBadge />
    </div>
  );
}
