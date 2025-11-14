import { Check, Clock, Minus } from 'lucide-react';
import type { KYCStatus } from '@/lib/types';

interface KYCIconProps {
  status: KYCStatus;
  showLabel?: boolean;
  className?: string;
}

export const KYCIcon = ({ status, showLabel = false, className = '' }: KYCIconProps) => {
  if (status === 'Verified') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="p-1 rounded-full bg-[#e6f9ee]">
          <Check size={14} strokeWidth={2.5} className="text-[#16a34a]" />
        </div>
        {showLabel && <span className="text-sm font-medium text-[#16a34a]">Verified</span>}
      </span>
    );
  }

  if (status === 'Pending') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="p-1 rounded-full bg-[#fff9e6]">
          <Clock size={14} strokeWidth={2} className="text-[#facc15]" />
        </div>
        {showLabel && <span className="text-sm font-medium text-[#92400e]">Pending</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[#6b7280] ${className}`}>
      <Minus size={14} strokeWidth={2} />
      {showLabel && <span className="text-sm font-medium">—</span>}
    </span>
  );
};
