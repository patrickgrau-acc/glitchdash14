/**
 * Navigation Configuration — Central route registry.
 *
 * INFRASTRUCTURE FILE — ADD entries here, don't create parallel nav files.
 * Every feature adds its routes to this config. The Sidebar component
 * reads this to render navigation links.
 *
 * @business-card
 * @module navigation
 * @exports NavItem, NAV_SECTIONS, NAV_APP_NAME, getNavItems
 */

/** App name shown in the sidebar header. */
export const NAV_APP_NAME = 'Dashboard';

export interface NavItem {
  /** Display label in the sidebar. */
  label: string;
  /** Route path (e.g. '/configure_landing_pages'). */
  path: string;
  /** Lucide icon name (e.g. 'Settings', 'BarChart'). */
  icon?: string;
  /** Sub-items for expandable sections. */
  children?: NavItem[];
}

export interface NavSection {
  /** Section heading in the sidebar. */
  title: string;
  /** Navigation items in this section. */
  items: NavItem[];
}

/**
 * Navigation sections — add your feature here.
 * The sidebar renders these in order. Each section is collapsible.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'GlitchDash', path: '/glitch_dash', icon: 'Gamepad2' },
      { label: 'System Status', path: '/health.html', icon: 'Activity' },
    ],
  },
  {
    title: 'Game Features',
    items: [
      { label: 'Game State', path: '/game_state_including', icon: 'Activity' },
      { label: 'Develop Single Page', path: '/develop_single_page', icon: 'Layout' },
      { label: 'Configure Parameters', path: '/configure_game_parameters', icon: 'Sliders' },
      { label: 'Deliver Self Contained', path: '/deliver_self_contained', icon: 'Package' },
      { label: 'Instant Retry', path: '/frictionless_instant_retry', icon: 'RotateCcw' },
      { label: 'High Energy Design', path: '/design_high_energy', icon: 'Zap' },
      { label: 'Responsive View', path: '/simple_responsive_one', icon: 'Smartphone' },
    ],
  },

  // Auto-added by shipper: pages missing from navigation config
  // These entries prevent TypeError crashes during Next.js prerendering
  {
    title: 'Additional Pages',
    items: [
    { label: 'Page.Tsx', path: '/page.tsx' }
    ]
  },
];

/** Flat list of all nav items (for route generation). */
export function getNavItems(): NavItem[] {
  return NAV_SECTIONS.flatMap(s => s.items.flatMap(i => [i, ...(i.children || [])]));
}
