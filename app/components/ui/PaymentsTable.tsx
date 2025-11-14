'use client';

import { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, Calendar } from 'lucide-react';

type PaymentStatus = 'Draft' | 'Pending' | 'Paid';

type Payment = {
  id: string;
  date: string;
  counterparty: string;
  details: string;
  amount: number;
  status: PaymentStatus;
};

type PaymentsTableProps = {
  payments: Payment[];
};

type TabType = 'all' | 'drafts' | 'pending' | 'paid';

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('LAST WEEK');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const tabs: Array<{ key: TabType; label: string; count?: number }> = [
    { key: 'all', label: 'All' },
    { key: 'drafts', label: 'Drafts', count: 3 },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
  ];

  const filteredPayments = payments.filter((payment) => {
    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'drafts' && payment.status !== 'Draft') return false;
      if (activeTab === 'pending' && payment.status !== 'Pending') return false;
      if (activeTab === 'paid' && payment.status !== 'Paid') return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.counterparty.toLowerCase().includes(query) ||
        payment.details.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return 'text-green-600 bg-green-50';
      case 'Pending':
        return 'text-blue-600 bg-blue-50';
      case 'Draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">PAYMENTS</h2>
          <button
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="View analytics"
          >
            Analytics →
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={`Show ${tab.label} payments`}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-orange-100 text-orange-600 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            aria-label="Filter by date"
          >
            <Calendar size={14} aria-hidden="true" />
            <span className="text-gray-500">DATE</span>
            <span className="text-gray-900">{dateFilter}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            aria-label="Filter by type"
          >
            <span className="text-gray-500">TYPE</span>
            <span className="text-gray-900">{typeFilter}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            aria-label="Search payments"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-gray-600 focus:ring-gray-400"
                  aria-label="Select all payments"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Counterparty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Payment Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide w-12">

              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPayments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-400"
                    aria-label={`Select payment ${payment.id}`}
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {payment.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {payment.date}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {payment.counterparty}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {payment.details}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={`More actions for payment ${payment.id}`}
                  >
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No payments found</p>
        </div>
      )}
    </div>
  );
}
