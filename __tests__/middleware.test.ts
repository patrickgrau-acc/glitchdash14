/**
 * Tests for domain-aware middleware routing.
 *
 * Verifies that requests to "/" are internally rewritten based on hostname:
 *   - alchemyglitchdash.com → /landing/alchemy
 *   - glitch-dash.com       → /landing/gaming
 *   - localhost / run.app   → passthrough (default game page)
 */

import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

function createRequest(host: string, pathname: string = '/', searchParams?: Record<string, string>): NextRequest {
  const url = new URL(pathname, `http://${host}`);
  if (searchParams) {
    for (const [key, val] of Object.entries(searchParams)) {
      url.searchParams.set(key, val);
    }
  }
  return new NextRequest(url, {
    headers: { host },
  });
}

describe('Domain-aware middleware', () => {
  describe('alchemyglitchdash.com → /landing/alchemy', () => {
    it('rewrites root path for alchemyglitchdash.com', () => {
      const req = createRequest('alchemyglitchdash.com');
      const res = middleware(req);

      // NextResponse.rewrite sets x-middleware-rewrite header
      expect(res.headers.get('x-middleware-rewrite')).toContain('/landing/alchemy');
    });

    it('rewrites root path for www.alchemyglitchdash.com', () => {
      const req = createRequest('www.alchemyglitchdash.com');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toContain('/landing/alchemy');
    });

    it('does not rewrite non-root paths for alchemyglitchdash.com', () => {
      const req = createRequest('alchemyglitchdash.com', '/dashboard');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });
  });

  describe('glitch-dash.com → /landing/gaming', () => {
    it('rewrites root path for glitch-dash.com', () => {
      const req = createRequest('glitch-dash.com');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toContain('/landing/gaming');
    });

    it('rewrites root path for www.glitch-dash.com', () => {
      const req = createRequest('www.glitch-dash.com');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toContain('/landing/gaming');
    });

    it('does not rewrite non-root paths for glitch-dash.com', () => {
      const req = createRequest('glitch-dash.com', '/glitch_dash');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });
  });

  describe('Default behavior (localhost, run.app, unknown hosts)', () => {
    it('passes through for localhost', () => {
      const req = createRequest('localhost:3000');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('passes through for Cloud Run .run.app domain', () => {
      const req = createRequest('glitchdash14-abc123-uc.a.run.app');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('passes through for unknown domains', () => {
      const req = createRequest('some-other-domain.com');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });
  });

  describe('?play bypass (landing page "Play" links reach the game)', () => {
    it('skips rewrite for alchemyglitchdash.com/?play', () => {
      const req = createRequest('alchemyglitchdash.com', '/', { play: '' });
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('skips rewrite for glitch-dash.com/?play', () => {
      const req = createRequest('glitch-dash.com', '/', { play: '' });
      const res = middleware(req);

      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    });
  });
});
