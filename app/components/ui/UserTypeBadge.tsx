import type { UserType } from '@/lib/types';

interface UserTypeBadgeProps {
  type: UserType;
  className?: string;
}

const typeStyles: Record<UserType, string> = {
  Distributor: 'bg-[#3B82F6] text-white border-[#3B82F6]',
  Retailer: 'bg-[#8B5CF6] text-white border-[#8B5CF6]',
  Customer: 'bg-[#10B981] text-white border-[#10B981]',
};

export const UserTypeBadge = ({ type, className = '' }: UserTypeBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeStyles[type]} ${className}`}
    >
      {type}
    </span>
  );
};
