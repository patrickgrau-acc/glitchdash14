"use client";
/**
 * Sidebar — App navigation sidebar.
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 * Reads from @/config/navigation and renders real Lucide icons via the
 * design-system <Icon> primitive, with active-route highlighting. Uses
 * semantic theme tokens so it inherits the selected design preset.
 *
 * @business-card
 * @module Sidebar
 * @exports Sidebar
 * @consumes NAV_SECTIONS from @/config/navigation, Icon from @/components/ui
 */

import React, { useEffect, useState } from 'react';
import { NAV_SECTIONS, NAV_APP_NAME } from '@/config/navigation';
import type { NavSection, NavItem } from '@/config/navigation';
import { JOURNEYS } from '@/config/journeys';
import { Icon } from '@/components/ui';

/**
 * Journey-derived sidebar sections. Each journey with at least one
 * resolvable step becomes a section; its steps (that have a real path)
 * become items in journey order — NOT alphabetical, NOT file-discovery
 * order. Falls back to NAV_SECTIONS (feature-directory grouping) when
 * there are no journeys, so builds without journeys.md render exactly as
 * before.
 */
function useSidebarSections(): NavSection[] {
  if (!JOURNEYS || JOURNEYS.length === 0) {
    return NAV_SECTIONS;
  }
  const journeySections: NavSection[] = JOURNEYS.map((journey) => ({
    title: journey.title,
    items: journey.steps
      .filter((step) => step.path)
      .map((step): NavItem => ({
        label: step.title,
        path: step.path as string,
        icon: 'Circle',
      })),
  })).filter((section) => section.items.length > 0);

  // Keep the Dashboard overview link (first NAV_SECTIONS entry) ahead of
  // the journey sections so there's always a way back to the hub.
  const overview = NAV_SECTIONS.find((s) => s.title === 'Dashboard');
  return overview ? [overview, ...journeySections] : journeySections;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [pathname, setPathname] = useState('');
  const sections = useSidebarSections();

  // Framework-agnostic active-route detection (works in Next.js and Vite).
  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const isActive = (path: string) =>
    pathname === path || (path !== '/' && pathname.startsWith(path + '/'));

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} shrink-0 min-h-screen flex flex-col
                  bg-surface border-r border-border transition-all duration-300`}
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <span className="font-heading font-semibold text-text truncate">
            {NAV_APP_NAME}
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-sm text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section: NavSection) => (
          <div key={section.title} className="mb-5 px-2">
            {!collapsed && (
              <h3 className="text-[0.7rem] font-medium uppercase tracking-wider text-text-muted px-3 mb-1.5">
                {section.title}
              </h3>
            )}
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 my-0.5 rounded-sm text-sm
                              transition-colors ${
                                active
                                  ? 'bg-primary-light text-primary-dark font-medium'
                                  : 'text-text-muted hover:bg-surface-alt hover:text-text'
                              }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                  )}
                  <Icon
                    name={item.icon || 'Circle'}
                    className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : ''}`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
