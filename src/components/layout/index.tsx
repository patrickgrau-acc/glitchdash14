'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_SECTIONS, NavItem } from '@/config/navigation';
import { Icon } from '@/components/ui';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-alt border-r border-border flex flex-col transition-transform transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="font-bold text-lg text-text tracking-wide">GlitchDash14</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-text-muted hover:text-text"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h4 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                  return (
                    <div key={iIdx} className="space-y-1">
                      <Link
                        href={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'text-text hover:bg-surface'
                        }`}
                      >
                        {item.icon && <Icon name={item.icon} className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </Link>
                      {item.children && item.children.length > 0 && (
                        <div className="pl-6 space-y-1 border-l border-border ml-4 mt-1">
                          {item.children.map((child, cIdx) => {
                            const isChildActive = pathname === child.path;
                            return (
                              <Link
                                key={cIdx}
                                href={child.path}
                                onClick={onClose}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                                  isChildActive
                                    ? 'text-primary font-semibold bg-primary/10'
                                    : 'text-text-muted hover:text-text hover:bg-surface'
                                }`}
                              >
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Arcade Edition</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono">v1.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (!pathname) return [{ label: 'Dashboard', path: '/' }];
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Dashboard', path: '/' }];
    let current = '';
    for (const seg of segments) {
      current += `/${seg}`;
      const formatted = seg.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      crumbs.push({ label: formatted, path: current });
    }
    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-surface text-text flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-72">
        <header className="h-16 border-b border-border bg-surface-alt/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-text-muted hover:text-text"
            >
              <Icon name="Menu" className="w-6 h-6" />
            </button>
            <nav className="flex items-center space-x-2 text-sm">
              {crumbs.map((c, idx) => (
                <React.Fragment key={c.path}>
                  {idx > 0 && <span className="text-text-muted">/</span>}
                  <Link
                    href={c.path}
                    className={`hover:text-primary transition-colors ${
                      idx === crumbs.length - 1 ? 'text-text font-semibold' : 'text-text-muted'
                    }`}
                  >
                    {c.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-surface border border-border text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Offline Ready</span>
            </div>
            <Link
              href="/glitch_dash/start"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Icon name="Play" className="w-4 h-4" />
              <span>Quick Play</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
