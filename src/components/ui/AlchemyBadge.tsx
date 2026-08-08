"use client";
import { useState, useEffect } from "react";

/**
 * AlchemyBadge — Global branding badge displayed on every page.
 * Shows "Made using Alchemy SDLC" with a link to the Alchemy website.
 *
 * Positioned in the lower-right corner above the VersionTag.
 * Auto-hides when any modal/overlay panel is open (z-50 overlays cover it).
 * Implements: Captain's directive 2026-07-28 (global branding)
 * Updated: 2026-08-05 (Auto-hide when detail panes are open — prevents submit button occlusion)
 */
export function AlchemyBadge() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Watch for overlay/modal panels that use fixed inset-0 (slide-in detail panes)
    // When detected, hide the badge so it doesn't cover submit buttons
    const observer = new MutationObserver(() => {
      const overlayOpen =
        document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
      setHidden(overlayOpen);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div
      id="alchemy-badge"
      className="fixed bottom-4 right-4 z-50 select-none"
      aria-label="Made using Alchemy SDLC"
    >
      <div
        className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/40 hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
        style={{ fontFamily: "Verdana, Geneva, sans-serif" }}
      >
        <a
          href="https://alchemistaipro.com/?utm_source=glitchdash&utm_medium=badge&utm_campaign=made-using-alchemy-sdlc"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline hover:no-underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Visit Alchemy SDLC; opens in a new tab"
        >
          <span className="text-xs font-semibold text-white">Made using </span>
          <span className="text-xs font-semibold text-white">Alche</span>
          <span className="text-xs font-semibold text-sky-300">my</span>
          <span className="text-xs font-semibold text-white"> SDLC</span>
        </a>
      </div>
    </div>
  );
}
