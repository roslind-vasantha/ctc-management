'use client';

import { TrendingUp, TrendingDown, CreditCard, FileText } from 'lucide-react';
import { Button } from './Button';

type BalanceOverviewProps = {
  totalBalance: number;
  balanceChange: number;
  overdraft: number;
  onPaymentClick?: () => void;
  onStatementClick?: () => void;
};

export function BalanceOverview({
  totalBalance,
  balanceChange,
  overdraft,
  onPaymentClick,
  onStatementClick,
}: BalanceOverviewProps) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(totalBalance);

  const formattedChange = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(balanceChange));

  const formattedOverdraft = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(overdraft);

  const isPositiveChange = balanceChange >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-gray-400" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-500">BALANCE</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">{formattedBalance}</h2>
              <p
                className={`text-sm font-medium mt-2 flex items-center gap-1 ${
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositiveChange ? '+' : ''}
                {formattedChange}
              </p>
            </div>

            <div className="ml-12">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={16} className="text-gray-400" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-500">OVERDRAFT</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{formattedOverdraft}</h3>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onPaymentClick}
            aria-label="Make a payment"
          >
            <CreditCard size={16} aria-hidden="true" />
            Payment
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onStatementClick}
            aria-label="Download statement"
          >
            <FileText size={16} aria-hidden="true" />
            Statement
          </Button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 mt-6" />
    </div>
  );
}
