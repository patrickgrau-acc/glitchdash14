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
    ],
  },
  // ── Feature sections are added below by each feature task ──
  // Example:
  // {
  //   title: 'Landing Pages',
  //   items: [
  //     { label: 'Configure', path: '/configure_landing_pages' },
  //     { label: 'Templates', path: '/configure_landing_pages/templates' },
  //   ],
  // },
];

/** Flat list of all nav items (for route generation). */
export function getNavItems(): NavItem[] {
  return NAV_SECTIONS.flatMap(s => s.items.flatMap(i => [i, ...(i.children || [])]));
}
