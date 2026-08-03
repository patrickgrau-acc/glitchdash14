export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Arcade Game',
    items: [
      {
        label: 'Play GlitchDash',
        path: '/glitch_dash',
        icon: 'Gamepad2',
        children: [
          { label: '① Start Game', path: '/glitch_dash/start' },
          { label: '② Live Play & Controls', path: '/glitch_dash/play' },
          { label: '③ High Scores & Stats', path: '/glitch_dash/scores' },
        ],
      },
    ],
  },
  {
    title: 'Configuration & Tuning',
    items: [
      {
        label: 'Game Balance',
        path: '/glitch_dash/config',
        icon: 'Sliders',
        children: [
          { label: '① Difficulty Scaling', path: '/glitch_dash/config/difficulty' },
          { label: '② Aesthetics & Audio', path: '/glitch_dash/config/aesthetics' },
        ],
      },
    ],
  },
  {
    title: 'System & Performance',
    items: [
      {
        label: 'Analytics & Debug',
        path: '/glitch_dash/analytics',
        icon: 'Activity',
        children: [
          { label: '① Performance Monitor', path: '/glitch_dash/analytics/monitor' },
          { label: '② Debug Mode', path: '/glitch_dash/analytics/debug' },
        ],
      },
    ],
  },
];

export function getNavItems(): NavItem[] {
  return NAV_SECTIONS.flatMap((section) => section.items);
}
