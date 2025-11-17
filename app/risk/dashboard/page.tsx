/**
 * Risk & Control Dashboard
 *
 * Focuses on dispute activity, KYC health, and systemic risk signals.
 * Consumes: disputes, transactions, retailers, customers
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { LineSeries } from '@/app/components/charts/LineSeries';
import { BarMini } from '@/app/components/charts/BarMini';
import { fmtPercent } from '@/lib/format';
import { transactions, disputes, retailers, customers } from '@/lib/data';
import { getRange, filterByRange, sum, count, percent, groupByDay, groupBy } from '@/lib/dashboard';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskDashboardPage() {
  const [days, setDays] = useState<30 | 90>(30);
  const range = useMemo(() => getRange(days), [days]);

  // Filter data by range
  const rangeRetailers = useMemo(() => filterByRange(retailers, range), [range]);
  const rangeCustomers = useMemo(() => filterByRange(customers, range), [range]);

  // KPIs
  const pendingDisputes = useMemo(
    () => count(disputes, (d) => d.status === 'pending'),
    []
  );
  const processingDisputes = useMemo(
    () => count(disputes, (d) => d.status === 'processing'),
    []
  );
  const resolvedDisputes = useMemo(
    () => count(disputes, (d) => d.status === 'resolved'),
    []
  );
  const rejectedDisputes = useMemo(
    () => count(disputes, (d) => d.status === 'rejected'),
    []
  );

  const kycFailureRate = useMemo(() => {
    const reviewed = [...rangeRetailers, ...rangeCustomers].filter(
      (profile) => profile.kycStatus === 'verified' || profile.kycStatus === 'rejected'
    );
    const failures = reviewed.filter((profile) => profile.kycStatus === 'rejected');
    return percent(failures.length, reviewed.length);
  }, [rangeRetailers, rangeCustomers]);

  // Charts data
  const disputesTrend = useMemo(() => {
    const created = groupByDay(disputes, () => 1);
    const resolvedSeries = groupByDay(
      disputes
        .filter((d) => d.status === 'resolved')
        .map((d) => ({ ...d, createdAt: d.updatedAt })),
      () => 1
    );

    const dateMap = new Map<string, { date: string; raised: number; resolved: number }>();
    created.forEach((item) => {
      dateMap.set(item.date, { date: item.date, raised: item.value, resolved: 0 });
    });
    resolvedSeries.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.resolved = item.value;
      } else {
        dateMap.set(item.date, { date: item.date, raised: 0, resolved: item.value });
      }
    });

    return Array.from(dateMap.values())
      .filter((item) => {
        const date = new Date(item.date);
        return date >= range.from && date <= range.to;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [disputes, range]);

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
  const disputesByDateMap = useMemo(() => {
    const map = new Map<string, number>();
    disputes.forEach((d) => {
      const key = new Date(d.createdAt).toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, []);

  const transactionsByDateMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, []);

  const riskAlerts = useMemo(() => {
    const alerts: Array<{ type: string; message: string; severity: 'high' | 'medium' }> = [];

    // High-value disputes
    const HIGH_VALUE_THRESHOLD = 150000; // ₹1.5L+
    const highValueDisputes = disputes.filter((d) => {
      const txn = transactions.find((t) => t.id === d.transactionId);
      return (
        txn &&
        txn.amount >= HIGH_VALUE_THRESHOLD &&
        (d.status === 'pending' || d.status === 'processing')
      );
    });
    if (highValueDisputes.length > 0) {
      alerts.push({
        type: 'High-value disputes',
        message: `${highValueDisputes.length} disputes on tickets ≥ ₹1.5L`,
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
    const retailerDisputes = groupBy(
      disputes.filter((d) => d.status === 'pending' || d.status === 'processing'),
      (d) => {
        const txn = transactions.find((t) => t.id === d.transactionId);
        return txn?.retailerId || '';
      }
    );
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

    // Sudden spike in dispute rate (today vs 7-day avg)
    const today = new Date();
    const toKey = (date: Date) => date.toISOString().split('T')[0];
    const getRate = (date: Date) => {
      const key = toKey(date);
      const disputesCount = disputesByDateMap.get(key) || 0;
      const txnsCount = transactionsByDateMap.get(key) || 0;
      if (txnsCount === 0) return null;
      return disputesCount / txnsCount;
    };

    const todayRate = getRate(today) ?? 0;
    let rollingSum = 0;
    let rollingSamples = 0;
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const rate = getRate(date);
      if (rate !== null) {
        rollingSum += rate;
        rollingSamples += 1;
      }
    }
    const rollingAvg = rollingSamples > 0 ? rollingSum / rollingSamples : null;
    if (rollingAvg && todayRate > rollingAvg * 1.5) {
      alerts.push({
        type: 'Dispute rate spike',
        message: `Today's dispute rate is ${fmtPercent(todayRate, 2)} vs ${fmtPercent(
          rollingAvg,
          2
        )} 7-day avg`,
        severity: 'medium',
      });
    }

    return alerts;
  }, [disputes, transactions, disputesByDateMap, transactionsByDateMap]);

  const highRiskSignals = riskAlerts.length;

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

      {/* Dispute Status KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          header="Pending Disputes"
          value={pendingDisputes}
          subtext="Awaiting triage"
          variant="warning"
        />
        <Card
          header="Processing Disputes"
          value={processingDisputes}
          subtext="Under investigation"
          variant="info"
        />
        <Card
          header="Resolved Disputes"
          value={resolvedDisputes}
          subtext="Closed with action"
          variant="success"
        />
        <Card
          header="Rejected Disputes"
          value={rejectedDisputes}
          subtext="Dismissed cases"
          variant="danger"
        />
      </div>

      {/* Risk Health KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card
          header="KYC Failure Rate"
          value={fmtPercent(kycFailureRate, 1)}
          subtext={`Reviewed profiles (${days}d)`}
          variant="warning"
        />
        <Card
          header="High-Risk Signals"
          value={highRiskSignals}
          subtext="Active alerts"
          variant="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-color)] mb-4">
                Disputes Raised vs Resolved
              </h3>
              <LineSeries
                data={disputesTrend}
                lines={[
                  { dataKey: 'raised', name: 'Raised', color: 'var(--danger-border)' },
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

