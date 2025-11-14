/**
 * Risk & Control Dashboard
 * 
 * Displays risk metrics, dispute tracking, card approval status, and KYC pass rates.
 * Consumes: disputes, transactions, cardApprovals, retailers, customers
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { LineSeries } from '@/app/components/charts/LineSeries';
import { BarMini } from '@/app/components/charts/BarMini';
import { fmtINR, fmtPercent, fmtDateIN } from '@/lib/format';
import { transactions, disputes, cardApprovals, retailers, customers } from '@/lib/data';
import { getRange, filterByRange, sum, count, percent, groupByDay, groupBy } from '@/lib/dashboard';
import { ShieldAlert, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

export default function RiskDashboardPage() {
  const [days, setDays] = useState<30 | 90>(30);
  const range = useMemo(() => getRange(days), [days]);

  // Filter data by range
  const rangeDisputes = useMemo(() => filterByRange(disputes, range), [range]);
  const rangeTransactions = useMemo(() => filterByRange(transactions, range), [range]);

  // KPIs
  const openDisputes = useMemo(
    () => count(disputes, (d) => d.status === 'open' || d.status === 'investigating'),
    []
  );

  const disputeRate = useMemo(() => {
    const totalDisputes = count(rangeDisputes);
    const totalTxns = count(rangeTransactions);
    return percent(totalDisputes, totalTxns);
  }, [rangeDisputes, rangeTransactions]);

  const pendingCardApprovals = useMemo(
    () => count(cardApprovals, (c) => c.status === 'pending'),
    []
  );

  const kycPassRate = useMemo(() => {
    const allUsers = [...retailers, ...customers];
    const verified = count(allUsers, (u) => u.kycStatus === 'verified');
    const total = count(allUsers, (u) => u.kycStatus !== undefined);
    return percent(verified, total);
  }, []);

  // Charts data
  const disputesByDay = useMemo(() => {
    const opened = groupByDay(
      disputes.filter((d) => d.status === 'open' || d.status === 'investigating'),
      () => 1
    );
    const resolved = groupByDay(
      disputes.filter((d) => d.status === 'resolved'),
      () => 1
    );

    // Merge by date
    const dateMap = new Map<string, { date: string; opened: number; resolved: number }>();
    opened.forEach((item) => {
      dateMap.set(item.date, { date: item.date, opened: item.value, resolved: 0 });
    });
    resolved.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.resolved = item.value;
      } else {
        dateMap.set(item.date, { date: item.date, opened: 0, resolved: item.value });
      }
    });

    return Array.from(dateMap.values())
      .filter((item) => {
        const date = new Date(item.date);
        return date >= range.from && date <= range.to;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [range]);

  const chargebackCustomers = useMemo(() => {
    const customerDisputes = groupBy(disputes, (d) => {
      const txn = transactions.find((t) => t.id === d.transactionId);
      return txn?.customerId || '';
    });

    return Object.entries(customerDisputes)
      .filter(([customerId]) => customerId)
      .map(([customerId, disputeList]) => {
        const customer = customers.find((c) => c.id === customerId);
        const txn = transactions.find((t) => t.id === disputeList[0].transactionId);
        const totalValue = sum(disputeList, () => txn?.amount || 0);
        return {
          name: customer
            ? `${customer.name.split(' ')[0]} ••••${customer.phone.slice(-4)}`
            : 'Unknown',
          value: disputeList.length,
          amount: totalValue,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, []);

  // Risk Alerts
  const riskAlerts = useMemo(() => {
    const alerts: Array<{ type: string; message: string; severity: 'high' | 'medium' }> = [];

    // High-value pending approvals
    const highValueApprovals = cardApprovals.filter(
      (a) => a.status === 'pending' && a.limitRequested > 200000
    );
    if (highValueApprovals.length > 0) {
      alerts.push({
        type: 'High-value approvals',
        message: `${highValueApprovals.length} pending card approvals with limit > ₹2,00,000`,
        severity: 'high',
      });
    }

    // Transactions pending > 24h
    const pendingTxns = transactions.filter(
      (t) => t.status === 'pending' && new Date().getTime() - new Date(t.createdAt).getTime() > 24 * 60 * 60 * 1000
    );
    if (pendingTxns.length > 0) {
      alerts.push({
        type: 'Stale transactions',
        message: `${pendingTxns.length} transactions pending for > 24 hours`,
        severity: 'medium',
      });
    }

    // Retailers with >3 open disputes
    const retailerDisputes = groupBy(disputes.filter((d) => d.status === 'open'), (d) => {
      const txn = transactions.find((t) => t.id === d.transactionId);
      return txn?.retailerId || '';
    });
    const problematicRetailers = Object.entries(retailerDisputes).filter(
      ([, list]) => list.length > 3
    );
    if (problematicRetailers.length > 0) {
      alerts.push({
        type: 'Problematic retailers',
        message: `${problematicRetailers.length} retailers with >3 open disputes`,
        severity: 'high',
      });
    }

    return alerts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[var(--foreground)]" />
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">Risk & Control</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 30
                ? 'bg-[var(--foreground)] text-white'
                : 'bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80'
            }`}
            onClick={() => setDays(30)}
          >
            30d
          </button>
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 90
                ? 'bg-[var(--foreground)] text-white'
                : 'bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--muted)]/80'
            }`}
            onClick={() => setDays(90)}
          >
            90d
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">Updated just now</p>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          header="Open Disputes"
          value={openDisputes}
          subtext="Requiring attention"
          variant="warning"
        />
        <Card
          header="Dispute Rate"
          value={fmtPercent(disputeRate, 2)}
          subtext={`Over last ${days} days`}
          variant="info"
        />
        <Card
          header="Pending Card Approvals"
          value={pendingCardApprovals}
          subtext="Awaiting review"
          variant="warning"
        />
        <Card
          header="KYC Pass Rate"
          value={fmtPercent(kycPassRate, 1)}
          subtext="Verified profiles"
          variant="success"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Disputes Opened vs Resolved
              </h3>
              <LineSeries
                data={disputesByDay}
                lines={[
                  { dataKey: 'opened', name: 'Opened', color: 'var(--danger-border)' },
                  { dataKey: 'resolved', name: 'Resolved', color: 'var(--success-border)' },
                ]}
                height={300}
              />
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Top Chargeback Customers
              </h3>
              <BarMini
                data={chargebackCustomers.map((c) => ({
                  name: c.name,
                  value: c.value,
                  color: 'var(--danger-border)',
                }))}
                height={300}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)]">Risk Alerts</h3>
              <div className="flex gap-2">
                <Link href="/disputes">
                  <Button variant="secondary" size="sm" icon={AlertTriangle}>
                    View Disputes
                  </Button>
                </Link>
                <Link href="/credit-card-approvals">
                  <Button variant="secondary" size="sm" icon={CheckCircle2}>
                    View Approvals
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              {riskAlerts.length > 0 ? (
                riskAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={alert.severity === 'high' ? 'danger' : 'warning'}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm font-medium text-[var(--text-color)]">
                            {alert.type}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No active risk alerts
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

