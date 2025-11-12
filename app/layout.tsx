'use client';

import './globals.css';
import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { SideNav } from './components/layout/SideNav';
import { ToastProvider } from './components/ui/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
