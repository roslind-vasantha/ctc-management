'use client';

import { Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccountCardProps = {
  accountNumber: string;
  accountType: string;
  balance: number;
  variant?: 'default' | 'primary';
  icon?: 'wallet' | 'card' | 'trending';
  hasNotification?: boolean;
};

export function AccountCard({
  accountNumber,
  accountType,
  balance,
  variant = 'default',
  icon = 'wallet',
  hasNotification = false,
}: AccountCardProps) {
  const IconComponent =
    icon === 'wallet' ? Wallet :
    icon === 'card' ? CreditCard :
    TrendingUp;

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]',
        variant === 'primary'
          ? 'bg-[#4C5FD5] text-white shadow-lg'
          : 'bg-white border border-gray-200 text-gray-900'
      )}
    >
      {hasNotification && (
        <div className="absolute top-4 right-4">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
            3
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'rounded-lg p-3',
            variant === 'primary'
              ? 'bg-white/20'
              : 'bg-orange-50'
          )}
        >
          <IconComponent
            size={20}
            className={variant === 'primary' ? 'text-white' : 'text-orange-500'}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-1',
              variant === 'primary' ? 'text-white/80' : 'text-gray-500'
            )}
          >
            {accountNumber}
          </p>
          <div className="h-1 w-12 bg-current opacity-20 rounded mb-3" />
          <h3
            className={cn(
              'text-base font-semibold mb-1',
              variant === 'primary' ? 'text-white' : 'text-gray-900'
            )}
          >
            {accountType}
          </h3>
          <p
            className={cn(
              'text-2xl font-bold',
              variant === 'primary' ? 'text-white' : 'text-gray-900'
            )}
          >
            {formattedBalance}
          </p>
        </div>
      </div>
    </div>
  );
}
