'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  ShieldCheck,
  Users,
  Percent,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Settings,
  X,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/management-onboarding', label: 'Management Onboarding', icon: UserPlus },
  { href: '/onboarding-approval', label: 'Onboarding Approval', icon: ShieldCheck },
  { href: '/profile-management', label: 'Profile Management', icon: Users },
  { href: '/commission-management', label: 'Commission Management', icon: Percent },
  { href: '/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/credit-card-approvals', label: 'Credit Card Approvals', icon: CheckCircle2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

type SideNavProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SideNav = ({ isOpen, onClose }: SideNavProps) => {
  const pathname = usePathname();
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-[var(--card-bg)] border-r border-[var(--border)]
          transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-[var(--border)]">
            <span className="text-lg font-semibold text-[var(--text-color)]">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onClose()}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? 'bg-[var(--foreground)] text-[var(--background)]'
                            : 'text-[var(--text-color)] hover:bg-[var(--muted)]'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

