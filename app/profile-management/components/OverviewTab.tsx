'use client';

import { useState } from 'react';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { fmtCurrency, fmtNumber, fmtDate, fmtPercent } from '@/lib/format';
import type { UnifiedProfile, SummaryMetrics, Transaction } from '@/lib/types';
import { Copy, ExternalLink } from 'lucide-react';

interface OverviewTabProps {
  profile: UnifiedProfile;
  metrics: SummaryMetrics;
  recentTransactions: Transaction[];
  onOpenParent?: () => void;
}

export const OverviewTab = ({
  profile,
  metrics,
  recentTransactions,
  onOpenParent,
}: OverviewTabProps) => {
  const [period, setPeriod] = useState<'30d' | '90d' | 'All'>('30d');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Onboarded By */}
      {profile.onboardedBy !== 'Admin' && onOpenParent && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Onboarded By:</span>
          <button
            onClick={onOpenParent}
            className="text-[#3B82F6] hover:underline flex items-center gap-1"
          >
            {profile.onboardedBy.name}
            <ExternalLink size={14} />
          </button>
        </div>
      )}

      {profile.onboardedBy === 'Admin' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Onboarded By:</span>
          <span className="font-medium text-[var(--text-color)]">Admin</span>
        </div>
      )}

      {/* Performance Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            Performance Summary
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

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Total Txns</div>
            <div className="text-2xl font-bold text-[var(--text-color)]">
              {fmtNumber(metrics.totalTxns)}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Success Txns</div>
            <div className="text-2xl font-bold text-[var(--text-color)]">
              {fmtNumber(metrics.successfulTxns)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              {fmtPercent(metrics.successRate, 1)} success rate
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Total GMV</div>
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

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
          Recent Transactions
        </h3>

        {recentTransactions.length > 0 ? (
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
                  {recentTransactions.slice(0, 10).map((txn) => (
                    <tr key={txn.id} className="hover:bg-[var(--muted)]">
                      <td className="px-4 py-3 text-sm text-[var(--text-color)]">{txn.id}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {fmtDate(txn.createdAt, 'short')}
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

            <div className="mt-4">
              <a
                href={`/transactions?profile=${profile.id}`}
                className="text-[#3B82F6] hover:underline text-sm inline-flex items-center gap-1"
              >
                View All Transactions
                <ExternalLink size={14} />
              </a>
            </div>
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
