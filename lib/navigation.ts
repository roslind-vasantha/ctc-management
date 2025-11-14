import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  LineChart,
  CreditCard,
  Percent,
  BarChart2,
  UserPlus,
  ShieldCheck,
  Users,
  Settings,
} from 'lucide-react';

export type NavItem = { label: string; href: string; icon: any };

export type NavSection = { title: string; items: NavItem[] };

export const topItem: NavItem = {
  label: 'Dashboard',
  href: '/',
  icon: LayoutDashboard,
};

export const navSections: NavSection[] = [
  {
    title: 'Risk & Compliance',
    items: [
      { label: 'Risk Dashboard', href: '/risk/dashboard', icon: BarChart3 },
      { label: 'Disputes', href: '/disputes', icon: AlertTriangle },
      { label: 'Credit Card Approvals', href: '/credit-card-approvals', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Finance Dashboard', href: '/finance/dashboard', icon: LineChart },
      { label: 'Transactions', href: '/transactions', icon: CreditCard },
      // { label: 'Commission Management', href: '/commission-management', icon: Percent },
    ],
  },
  {
    title: 'Operations / Support',
    items: [
      { label: 'Operations Dashboard', href: '/operations/dashboard', icon: BarChart2 },
      { label: 'Management Onboarding', href: '/management-onboarding', icon: UserPlus },
      { label: 'Onboarding Approvals', href: '/onboarding-approval', icon: ShieldCheck },
      { label: 'Profile Management', href: '/profile-management', icon: Users },
    ],
  },
  {
    title: 'Configuration & Control',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];


