'use client';

import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { ToastProvider } from '../ui/Toast';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <SideNav
          isOpen={isMobile ? sideNavOpen : undefined}
          onClose={isMobile ? () => setSideNavOpen(false) : undefined}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar onMenuClick={() => setSideNavOpen(true)} />

          <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

