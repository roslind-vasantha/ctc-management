'use client';

import { useState } from 'react';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { fmtCurrency, fmtNumber, fmtDate, fmtPercent } from '@/lib/format';
import type { Transaction, SummaryMetrics } from '@/lib/types';
import { Download } from 'lucide-react';

interface TransactionsTabProps {
  profileId: string;
  transactions: Transaction[];
  metrics: SummaryMetrics;
  onExportCSV: () => void;
}

export const TransactionsTab = ({
  profileId,
  transactions,
  metrics,
  onExportCSV,
}: TransactionsTabProps) => {
  const [period, setPeriod] = useState<'30d' | '90d' | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const totalPages = Math.ceil(transactions.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + perPage);

  return (
    <div className="space-y-6">
      {/* Transaction Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            Transaction Metrics
          </h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1 border border-[var(--border)] rounded-lg text-sm bg-white"
          >
            <option value="30d">30d</option>
            <option value="90d">90d</option>
            <option value="All">All Time</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-[var(--text-color)]">
              {fmtPercent(metrics.successRate, 1)}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">GMV</div>
            <div className="text-2xl font-bold text-[var(--text-color)]">
              {fmtCurrency(metrics.gmv)}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Avg Ticket</div>
            <div className="text-2xl font-bold text-[var(--text-color)]">
              {fmtCurrency(metrics.avgTicket)}
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div>
        <Button variant="secondary" icon={Download} onClick={onExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Transactions Table */}
      <div>
        {transactions.length > 0 ? (
          <>
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-color)]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color)]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-color)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-[var(--muted)]">
                      <td className="px-4 py-3 text-sm text-[var(--text-color)]">{txn.id}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {fmtDate(txn.createdAt, 'long')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-[var(--text-color)]">
                        {fmtCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            txn.status === 'success'
                              ? 'success'
                              : txn.status === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {txn.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-[var(--muted-foreground)]">
                  Showing {startIndex + 1}-{Math.min(startIndex + perPage, transactions.length)} of{' '}
                  {transactions.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                  >
                    ←
                  </button>
                  <span className="text-sm text-[var(--text-color)]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="border border-[var(--border)] rounded-xl p-8 text-center text-[var(--muted-foreground)]">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
};
