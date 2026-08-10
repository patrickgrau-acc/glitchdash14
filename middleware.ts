import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain-aware middleware for GlitchDash14.
 *
 * When the request path is exactly "/", inspect the Host header:
 *   - alchemyglitchdash.com → internal rewrite to /landing/alchemy
 *   - glitch-dash.com       → internal rewrite to /landing/gaming
 *
 * All other paths pass through untouched.
 * localhost, *.run.app (Cloud Run), and any unrecognized hosts
 * serve the default "/" (the game canvas).
 *
 * This is an internal rewrite (URL stays as "/") — no browser redirect.
 */

const DOMAIN_ROUTES: Record<string, string> = {
  'alchemyglitchdash.com': '/landing/alchemy',
  'www.alchemyglitchdash.com': '/landing/alchemy',
  'glitch-dash.com': '/landing/gaming',
  'www.glitch-dash.com': '/landing/gaming',
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Only act on the root path
  if (pathname !== '/') {
    return NextResponse.next();
  }

  // Allow explicit opt-out to reach the game (e.g. "/?play" from landing pages)
  if (searchParams.has('play')) {
    return NextResponse.next();
  }

  // Extract hostname (strip port if present for local dev)
  const host = request.headers.get('host')?.split(':')[0] ?? '';

  const rewritePath = DOMAIN_ROUTES[host];
  if (rewritePath) {
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    return NextResponse.rewrite(url);
  }

  // Default: serve normal "/" (game canvas) for localhost, run.app, etc.
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
