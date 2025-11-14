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
        className="flex gap-1 border-b border-[#e5e7eb]"
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
              relative px-5 py-3 font-medium text-sm transition-all rounded-t-lg
              focus:outline-none
              ${
                activeTab === tab.id
                  ? 'text-[var(--text-color)]'
                  : 'text-[#6b7280] hover:text-[var(--text-color)] hover:bg-[#f9fafb]'
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-8"
      >
        {activeContent}
      </div>
    </div>
  );
};

