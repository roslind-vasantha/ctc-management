import type { UserType } from '@/lib/types';

interface UserTypeBadgeProps {
  type: UserType;
  className?: string;
}

const typeStyles: Record<UserType, string> = {
  Distributor: 'bg-blue-50 text-blue-700 border-blue-200',
  Retailer: 'bg-purple-50 text-purple-700 border-purple-200',
  Customer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
