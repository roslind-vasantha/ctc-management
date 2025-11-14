'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { ToastProvider } from '../ui/Toast';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [sideNavOpen, setSideNavOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <SideNav isOpen={sideNavOpen} onClose={() => setSideNavOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSideNavOpen(true)} />

          <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

