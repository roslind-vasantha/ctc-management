'use client';

import { Bell, User, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

type TopBarProps = {
  onMenuClick: () => void;
};

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card-bg)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-color)]">
          Card-to-Cash Management
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={Bell} aria-label="Notifications">
          <span className="hidden sm:inline">Notifications</span>
        </Button>
        <Button variant="ghost" size="sm" icon={User} aria-label="Profile">
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </div>
    </header>
  );
};

