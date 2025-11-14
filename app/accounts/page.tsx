'use client';

import { useState } from 'react';
import { AccountCard } from '../components/ui/AccountCard';
import { BalanceOverview } from '../components/ui/BalanceOverview';
import { PaymentsTable } from '../components/ui/PaymentsTable';
import { CreditCard } from 'lucide-react';

type Account = {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  variant?: 'default' | 'primary';
  icon?: 'wallet' | 'card' | 'trending';
  hasNotification?: boolean;
};

type Payment = {
  id: string;
  date: string;
  counterparty: string;
  details: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Paid';
};

export default function AccountsPage() {
  // Mock data for accounts
  const accounts: Account[] = [
    {
      id: '1',
      accountNumber: 'BE1985...66',
      accountType: 'Salary',
      balance: 21981.0,
      variant: 'default',
      icon: 'wallet',
    },
    {
      id: '2',
      accountNumber: 'BE1985...57',
      accountType: 'Main',
      balance: 4398.0,
      variant: 'default',
      icon: 'card',
      hasNotification: true,
    },
    {
      id: '3',
      accountNumber: 'BE1985...58',
      accountType: 'For expenses',
      balance: 20080.0,
      variant: 'primary',
      icon: 'trending',
    },
  ];

  // Mock data for payments
  const payments: Payment[] = [
    {
      id: '#127',
      date: '10 Nov 2019',
      counterparty: 'Amazon',
      details: 'Online Purchase at Amazon.com',
      amount: 420.0,
      status: 'Draft',
    },
    {
      id: '#126',
      date: '04 Nov 2019',
      counterparty: 'VideoSmart',
      details: 'Payment for delivery',
      amount: 20.0,
      status: 'Pending',
    },
    {
      id: '#125',
      date: '12 Oct 2019',
      counterparty: 'eBay',
      details: 'Online purchase at eBay.com',
      amount: 2629.0,
      status: 'Paid',
    },
    {
      id: '#124',
      date: '10 Oct 2019',
      counterparty: 'Office Networks',
      details: 'Salary Payment',
      amount: 7090.0,
      status: 'Pending',
    },
    {
      id: '#123',
      date: '09 Oct 2019',
      counterparty: 'Car Repair Shop',
      details: 'Payment for Service',
      amount: 50.0,
      status: 'Paid',
    },
    {
      id: '#122',
      date: '09 Oct 2019',
      counterparty: 'Vodafone',
      details: 'Payment for Mobile Phone',
      amount: 30.0,
      status: 'Paid',
    },
  ];

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const balanceChange = 892.0; // Mock change value
  const overdraft = 1213.0; // Mock overdraft value

  const handlePaymentClick = () => {
    console.log('Payment button clicked');
    // Add payment logic here
  };

  const handleStatementClick = () => {
    console.log('Statement button clicked');
    // Add statement download logic here
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Main page
          </a>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 font-medium">Accounts</span>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              accountNumber={account.accountNumber}
              accountType={account.accountType}
              balance={account.balance}
              variant={account.variant}
              icon={account.icon}
              hasNotification={account.hasNotification}
            />
          ))}
        </div>

        {/* Add Card Button */}
        <div className="flex justify-end">
          <button
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
            aria-label="Add new account"
          >
            <CreditCard size={20} className="text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* Balance Overview */}
        <BalanceOverview
          totalBalance={totalBalance}
          balanceChange={balanceChange}
          overdraft={overdraft}
          onPaymentClick={handlePaymentClick}
          onStatementClick={handleStatementClick}
        />

        {/* Payments Table */}
        <PaymentsTable payments={payments} />
      </div>
    </div>
  );
}
