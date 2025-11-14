import type { ProfileStatus } from '@/lib/types';

interface StatusPillProps {
  status: ProfileStatus;
  className?: string;
}

const statusStyles: Record<ProfileStatus, string> = {
  Active: 'bg-[#e6f9ee] text-[#166534] border-[#82d4a3]',
  Suspended: 'bg-[#ffeaea] text-[#991b1b] border-[#f87171]',
  'Pending KYC': 'bg-[#fff9e6] text-[#92400e] border-[#fcd34d]',
};

export const StatusPill = ({ status, className = '' }: StatusPillProps) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
};
