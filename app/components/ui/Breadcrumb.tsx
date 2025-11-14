'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isSecondLast = index === items.length - 2;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#3B82F6] hover:underline transition-colors"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'text-[var(--text-color)] font-semibold' : 'text-[#6b7280]'}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight
                size={14}
                className={`${isSecondLast ? 'text-[#6b7280] opacity-60' : 'text-[#9ca3af] opacity-40'}`}
                aria-hidden="true"
                strokeWidth={2}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
};
