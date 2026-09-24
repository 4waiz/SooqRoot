import {
  Activity,
  ScanLine,
  Award,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Cpu,
  Gauge,
  Layers,
  Leaf,
  MessageSquare,
  Network,
  PackageCheck,
  Settings,
  ShieldCheck,
  Sprout,
  Truck,
  TriangleAlert,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Gauge;
  /** Shown as a small counter pill in the sidebar. */
  badgeKey?: 'exceptions' | 'atRisk' | 'copilot';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Control Tower', icon: Gauge }],
  },
  {
    label: 'Procurement',
    items: [
      { to: '/demand', label: 'Buyer Demand', icon: ClipboardList },
      { to: '/cycles', label: 'Procurement Cycles', icon: Layers },
      { to: '/orders', label: 'Orders', icon: PackageCheck, badgeKey: 'atRisk' },
      { to: '/engine', label: 'Commitment Engine', icon: Cpu },
    ],
  },
  {
    label: 'Supply Network',
    items: [
      { to: '/farms', label: 'Farms', icon: Sprout },
      { to: '/network', label: 'Supply Digital Twin', icon: Network },
      { to: '/harvest', label: 'Harvest Calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/exceptions', label: 'Exceptions', icon: TriangleAlert, badgeKey: 'exceptions' },
      { to: '/fulfilment', label: 'Fulfilment', icon: Truck },
      { to: '/quality', label: 'Quality Check', icon: ScanLine },
      { to: '/passports', label: 'Batch Passports', icon: ShieldCheck },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/index', label: 'Local Procurement Index', icon: Activity },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/impact', label: 'Sustainability Impact', icon: Leaf },
    ],
  },
  {
    label: 'Communication',
    items: [{ to: '/copilot', label: 'Farmer Copilot', icon: MessageSquare, badgeKey: 'copilot' }],
  },
  {
    label: 'System',
    items: [
      { to: '/scenario', label: 'Demo Scenario', icon: Sprout },
      { to: '/recognition', label: 'Recognition', icon: Award },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
