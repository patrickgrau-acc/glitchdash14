"use client";
/**
 * MainLayout — App shell with sidebar, topbar, and content area.
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 * Wrap your app or feature pages with this layout. Uses semantic theme
 * tokens so the shell inherits the selected design preset automatically.
 *
 * AUTH ROUTES RENDER BARE: on /login, /register, /signup, /forgot-password,
 * /reset-password and /auth/* the shell (sidebar + topbar) is hidden and the
 * children render in a centered full-page container. Unauthenticated entry
 * points must never leak the authenticated app chrome. This means a page can
 * be routed through MainLayout uniformly — the layout decides whether to show
 * the shell — so callers never need a separate auth layout.
 *
 * @business-card
 * @module MainLayout
 * @exports MainLayout
 * @consumes Sidebar from @/components/layout/Sidebar, Icon from @/components/ui,
 *           ToastViewport from @/components/notifications
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Icon } from '@/components/ui';
import { ToastViewport } from '@/components/notifications';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Route prefixes that render OUTSIDE the app shell (no sidebar / topbar).
 * Anchored + boundary-terminated so '/author' or '/registrations-report' do
 * NOT match — only real auth entry points do.
 */
const AUTH_ROUTE_PATTERNS: RegExp[] = [
  /^\/login(\/|$)/,
  /^\/logout(\/|$)/,
  /^\/register(\/|$)/,
  /^\/signup(\/|$)/,
  /^\/sign-up(\/|$)/,
  /^\/signin(\/|$)/,
  /^\/sign-in(\/|$)/,
  /^\/forgot-password(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/auth(\/|$)/,
  /^\/authenticate/,
];

/** Framework-agnostic (Vite + Next.js) current-path → is-auth-route check. */
function useIsAuthRoute(): boolean {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : ''
  );
  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return AUTH_ROUTE_PATTERNS.some((re) => re.test(pathname));
}

export function MainLayout({ children }: MainLayoutProps) {
  const isAuthRoute = useIsAuthRoute();

  // Unauthenticated entry point — dedicated full-page space. No sidebar, no
  // topbar, no journey helper. Just a centered container for the auth form.
  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt text-text p-4">
        <div className="w-full max-w-md">{children}</div>
        <ToastViewport />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-alt text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-end gap-2 px-6
                           bg-surface/80 backdrop-blur border-b border-border sticky top-0 z-10">
          <button
            className="p-2 rounded-sm text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
            aria-label="Search"
          >
            <Icon name="Search" className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-sm text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
            aria-label="Notifications"
          >
            <Icon name="Bell" className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark
                          flex items-center justify-center">
            <Icon name="User" className="w-4 h-4" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
