'use client';

import { ReactNode, useState, KeyboardEvent } from 'react';

export type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
};

export const Tabs = ({ tabs, defaultTab, onChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tabId);
    }
  };
  
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
  
  return (
    <div className="w-full">
      <div
        className="flex border-b border-[var(--border)]"
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={`
              px-4 py-2 font-medium text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2
              ${
                activeTab === tab.id
                  ? 'border-b-2 border-[var(--foreground)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--text-color)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeContent}
      </div>
    </div>
  );
};

